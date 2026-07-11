import json
import httpx
from typing import Any, Dict, List
from core.config import settings

from services.seo_keywords_dataset import SEO_DOMAINS_DATASET, get_dataset_summary

class GeminiService:
    def __init__(self):
        self.api_key = settings.GOOGLE_API_KEY
        self.model = settings.GOOGLE_MODEL
        self.base_url = settings.GOOGLE_BASE_URL.rstrip('/')

    async def _generate(self, prompt: str, response_json: bool = False) -> str:
        if not self.api_key:
            raise Exception("Google API Key not configured")
        
        # Using the standard Gemini API v1beta generateContent endpoint
        url = f"{self.base_url}/{self.model}:generateContent?key={self.api_key}"
        
        generation_config: Dict[str, Any] = {
            "temperature": 0.7,
            "topK": 40,
            "topP": 0.95,
            "maxOutputTokens": 4096,
        }
        
        # Disable thinking process for Gemini 2.x models to prevent response truncation
        if "gemini-2" in self.model:
            generation_config["thinkingConfig"] = {
                "thinkingBudget": 0
            }
            
        if response_json:
            generation_config["responseMimeType"] = "application/json"
            
        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }],
            "generationConfig": generation_config
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, timeout=30.0)
            response.raise_for_status()
            data = response.json()
            
            try:
                return data['candidates'][0]['content']['parts'][0]['text']
            except (KeyError, IndexError):
                raise Exception("Failed to extract text from Gemini response")

    def _clean_json(self, text: str) -> str:
        text = text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return text.strip()

gemini = GeminiService()

async def generate_seo_analysis(content: str, keywords: List[Dict], structure: Dict) -> Dict:
    if not settings.GOOGLE_API_KEY:
        # Fallback to local logic if no API key
        return _local_seo_analysis(content, structure)
    
    keywords_list = [f"{k['keyword']} ({k['density']}%)" for k in keywords[:5]]
    
    prompt = f"""Tu es un expert SEO professionnel. Analyse le contenu suivant et réponds UNIQUEMENT en JSON valide.
    
CONTENU:
{content[:3000]}

MOTS-CLÉS DÉTECTÉS:
{', '.join(keywords_list)}

STRUCTURE:
- Mots: {structure.get('word_count', 0)}
- Paragraphes: {structure.get('paragraph_count', 0)}
- Titres H1/H2/H3: {structure.get('h1_count', 0)}/{structure.get('h2_count', 0)}/{structure.get('h3_count', 0)}

Génère une analyse JSON avec EXACTEMENT cette structure:
{{
    "score": 85,
    "summary": "Résumé de l'analyse",
    "tone": "Le ton global du texte (ex: Informatif, Persuasif, Formel...)",
    "target_audience": "Le public cible estimé",
    "strengths": ["point 1", "point 2"],
    "weaknesses": ["point 1", "point 2"],
    "recommendations": [
        {{"type": "content", "priority": "high", "title": "Titre", "description": "Description", "suggestion": "Action concrète"}}
    ]
}}
"""

    try:
        text = await gemini._generate(prompt, response_json=True)
        return json.loads(gemini._clean_json(text))
    except Exception as e:
        print(f"Error in Gemini analysis: {e}")
        return _local_seo_analysis(content, structure)

async def generate_metadata(content: str, detected_keywords: List[Dict]) -> Dict:
    # Set up local fallback values first
    primary_keyword = detected_keywords[0]["keyword"] if detected_keywords else "contenu"
    matched_domain_key = "marketing"
    matched_domain_name = "Marketing, SEO & Communication"
    max_matches = 0
    
    content_lower = content.lower()
    for key, data in SEO_DOMAINS_DATASET.items():
        matches = 0
        for kw_item in data["keywords"]:
            if kw_item["keyword"].lower() in content_lower:
                matches += 1
        if matches > max_matches:
            max_matches = matches
            matched_domain_key = key
            matched_domain_name = data["name"]
            
    domain_data = SEO_DOMAINS_DATASET[matched_domain_key]
    fallback_recommended = []
    for item in domain_data["keywords"][:5]:
        fallback_recommended.append({
            "keyword": item["keyword"],
            "volume": item["volume"],
            "competition": item["competition"],
            "relevance": 80
        })
        
    fallback_focus = primary_keyword
    if len(fallback_focus) < 4 and domain_data["keywords"]:
        fallback_focus = domain_data["keywords"][0]["keyword"]
        
    fallback_result = {
        "title": f"Guide Complet sur {fallback_focus.title()[:40]}",
        "meta_description": f"Découvrez tout ce qu'il faut savoir sur {fallback_focus}. Conseils d'experts et analyse détaillée pour booster votre visibilité.",
        "focus_keyword": fallback_focus,
        "domain_identified": matched_domain_name,
        "recommended_keywords": fallback_recommended
    }

    if not settings.GOOGLE_API_KEY:
        return fallback_result

    keywords_str = ", ".join([f"{k['keyword']} ({k['count']}x)" for k in detected_keywords[:5]]) if detected_keywords else "aucun"
    dataset_summary = get_dataset_summary()
    
    prompt = f"""Tu es un expert en référencement naturel (SEO) francophone.
Analyse le contenu textuel et les mots-clés les plus fréquents détectés ci-dessous pour :
1. Identifier le domaine d'activité (ou industrie/secteur) principal parmi la liste fournie ci-dessous.
2. Sélectionner ou formuler un mot-clé principal cible ("focus_keyword") hautement professionnel, réaliste et recherché par les utilisateurs sur les moteurs de recherche. Attention : évite absolument d'utiliser un simple nom de marque propre (comme "racine") ou un mot vide générique sauf s'il est au cœur d'une intention de recherche pertinente. Il doit s'agir d'une expression de recherche pro (ex: "école privée Marrakech", "formation professionnelle", "logiciel de comptabilité").
3. Générer des suggestions de balise Title SEO (50-60 caractères) et de Meta Description (150-160 caractères) optimisées, percutantes et contenant ce mot-clé principal cible.
4. Recommander 4 à 5 mots-clés professionnels supplémentaires (liés au domaine identifié ou sémantiquement pertinents pour le contenu) avec des estimations réalistes de Volume mensuel de recherche, de Compétition (Faible, Moyenne, Élevée) et un score de pertinence par rapport au texte (%).

MOTS-CLÉS BRUTS DÉTECTÉS (Par ordre de fréquence) :
{keywords_str}

CONTENU (Extrait) :
{content[:1500]}

LISTE DES DOMAINES D'ACTIVITÉ DISPONIBLES ET LEURS MOTS-CLÉS DE RÉFÉRENCE :
{dataset_summary}

Réponds UNIQUEMENT sous forme de JSON valide avec EXACTEMENT cette structure :
{{
    "title": "Titre optimisé (50-60 caractères)",
    "meta_description": "Description optimisée (150-160 caractères)",
    "focus_keyword": "mot-clé principal cible professionnel",
    "domain_identified": "Nom exact du domaine identifié (ex: Éducation & Formation)",
    "recommended_keywords": [
        {{
            "keyword": "mot-clé recommandé",
            "volume": "estimation du volume de recherche (ex: 5k - 10k, 50k - 100k, 500 - 1k)",
            "competition": "Compétition (Faible, Moyenne, ou Élevée)",
            "relevance": 95
        }}
    ]
}}
"""

    try:
        text = await gemini._generate(prompt, response_json=True)
        return json.loads(gemini._clean_json(text))
    except Exception as e:
        print(f"Error in Gemini metadata: {e}")
        return fallback_result

async def suggest_reformulations(content: str, target_keyword: str) -> List[str]:
    import time
    
    if not settings.GOOGLE_API_KEY:
        return [
            f"Optimisez l'usage du mot-clé '{target_keyword}' dans vos paragraphes.",
            f"Améliorez la structure de vos titres pour inclure '{target_keyword}'."
        ]
    
    # Adding a timestamp to the prompt to encourage fresh generation
    timestamp = int(time.time())
    prompt = f"""Tu es un rédacteur SEO expert et créatif. Voici le contenu d'un article qui cible le mot-clé '{target_keyword}'. 
    
    CONTENU ACTUEL:
    {content[:2000]}
    
    TACHE:
    Propose 3 reformulations CONCRÈTES et VARIÉES de passages de ce texte (ou de nouvelles versions de phrases clés) pour le rendre plus percutant et mieux optimisé pour '{target_keyword}'. 
    Chaque suggestion doit être une phrase prête à l'emploi, pas un conseil générique.
    
    ID UNIQUE: {timestamp}
    
    Réponds EXCLUSIVEMENT sous forme de JSON valide avec cette structure: {{"suggestions": ["phrase 1", "phrase 2", "phrase 3"]}}
    """

    try:
        text = await gemini._generate(prompt, response_json=True)
        suggestions = json.loads(gemini._clean_json(text)).get("suggestions", [])
        if not suggestions:
            raise Exception("Empty suggestions list")
        return suggestions
    except Exception as e:
        print(f"Error in Gemini suggestions: {e}")
        # Fallback with target keyword to show it's working
        return [
            f"Réécriture suggérée : Intégrez '{target_keyword}' dès le premier paragraphe pour capter l'attention.",
            f"Variation : '{target_keyword}' devrait être le sujet principal de votre introduction.",
            f"Conseil : Utilisez des termes sémantiquement proches de '{target_keyword}' pour enrichir le contenu."
        ]

def _local_seo_analysis(content: str, structure: Dict) -> Dict:
    words = structure.get('word_count', len(content.split()))
    score = 60.0
    strengths = ["Contenu présent"]
    weaknesses = []
    
    if words > 600:
        score += 15
        strengths.append("Bonne longueur")
    else:
        weaknesses.append("Texte trop court")
    
    if structure.get('h1_count', 0) >= 1:
        score += 10
        strengths.append("H1 présent")
    else:
        weaknesses.append("Manque de H1")
    
    return {
        "score": min(95.0, score),
        "summary": "Analyse structurelle locale (IA non configurée).",
        "tone": "Neutre (IA désactivée)",
        "target_audience": "Général",
        "strengths": strengths,
        "weaknesses": weaknesses,
        "recommendations": [
            {"type": "content", "priority": "medium", "title": "Enrichir le texte", "description": "Le texte est un peu court", "suggestion": "Ajoutez 200-300 mots supplémentaires."}
        ]
    }
