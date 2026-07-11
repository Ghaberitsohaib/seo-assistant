import httpx
from bs4 import BeautifulSoup
from typing import Dict, Optional
import re

async def scrape_url(url: str) -> Dict:
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Ch-Ua": '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1"
    }
    
    try:
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True, headers=headers) as client:
            response = await client.get(url)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, "html.parser")
            
            title = extract_title(soup)
            meta_description = extract_meta_description(soup)
            content = extract_main_content(soup)
            
            return {
                "success": True,
                "url": url,
                "title": title,
                "meta_description": meta_description,
                "content": content,
                "word_count": len(content.split()) if content else 0
            }
    except httpx.TimeoutException:
        return {
            "success": False,
            "error": "Délai d'attente dépassé"
        }
    except httpx.HTTPStatusError as e:
        return {
            "success": False,
            "error": f"Erreur HTTP: {e.response.status_code}"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def extract_title(soup: BeautifulSoup) -> Optional[str]:
    title_tag = soup.find("title")
    if title_tag:
        return title_tag.get_text().strip()
    
    h1_tag = soup.find("h1")
    if h1_tag:
        return h1_tag.get_text().strip()
    
    return None

def extract_meta_description(soup: BeautifulSoup) -> Optional[str]:
    meta = soup.find("meta", attrs={"name": "description"})
    if meta and meta.get("content"):
        content_val = meta["content"]
        if isinstance(content_val, list):
            content_val = " ".join(content_val)
        return content_val.strip()
    return None

def extract_main_content(soup: BeautifulSoup) -> str:
    # 1. Remove non-content tags
    for tag in soup(["script", "style", "nav", "header", "footer", "aside"]):
        tag.decompose()
        
    body = soup.find("body")
    body_text = body.get_text(separator="\n", strip=True) if body else ""
    
    # 2. Try to find semantic main content containers
    article = soup.find("article")
    if article:
        text = article.get_text(separator="\n", strip=True)
        if len(text) >= 100 and len(text) >= 0.2 * len(body_text):
            return text
            
    main = soup.find("main")
    if main:
        text = main.get_text(separator="\n", strip=True)
        if len(text) >= 100 and len(text) >= 0.2 * len(body_text):
            return text
            
    # 3. Look for typical content/main/article class divs
    content_divs = soup.find_all("div", class_=re.compile(r"content|article|post|entry|main", re.I))
    filtered_divs = []
    for div in content_divs:
        class_val = div.get("class")
        if isinstance(class_val, list):
            class_str = " ".join(class_val)
        elif isinstance(class_val, str):
            class_str = class_val
        else:
            class_str = ""
            
        if any(w in class_str.lower() for w in ["header", "footer", "nav", "menu", "template"]):
            continue
        filtered_divs.append(div)
        
    if filtered_divs:
        best_div = max(filtered_divs, key=lambda d: len(d.get_text()))
        best_text = best_div.get_text(separator="\n", strip=True)
        if len(best_text) >= 200 and len(best_text) >= 0.3 * len(body_text):
            return best_text
            
    # 4. Fallback to the cleaned body
    if len(body_text) >= 50:
        return body_text
        
    return soup.get_text(separator="\n", strip=True)
