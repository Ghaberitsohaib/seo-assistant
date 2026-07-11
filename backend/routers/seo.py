from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional, Any, cast
from datetime import datetime
from database import get_db
from models.user import User
from models.analysis import Analysis
from schemas.analysis import (
    TextAnalysisRequest, UrlAnalysisRequest, AnalysisResponse,
    AnalysisHistoryResponse, BookmarkUpdate, KeywordData,
    MetadataSuggestions, Recommendation, ContentStructure
)
from core.security import get_current_user
from services.nlp_service import extract_keywords, analyze_structure, calculate_readability_score
from services.ai_service import generate_seo_analysis, generate_metadata, suggest_reformulations
import json
from services.scraper import scrape_url

router = APIRouter(prefix="/seo", tags=["SEO Analysis"])

@router.post("/analyze-text", response_model=AnalysisResponse)
async def analyze_text(
    request: TextAnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if user has sufficient credits (tokens)
    if current_user.role != "admin" and (current_user.credits is None or current_user.credits <= 0):
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Solde de jetons insuffisant. Veuillez acheter des jetons pour continuer."
        )
            
    content = request.content
    
    keywords = extract_keywords(content)
    structure = analyze_structure(content)
    readability_score = calculate_readability_score(content)
    
    ai_result = await generate_seo_analysis(content, keywords, structure)
    
    metadata = await generate_metadata(content, keywords)
    
    seo_score = ai_result.get("score", 50)
    
    recommendations = [
        Recommendation(
            type=rec.get("type", "general"),
            priority=rec.get("priority", "medium"),
            title=rec.get("title", ""),
            description=rec.get("description", ""),
            suggestion=rec.get("suggestion")
        )
        for rec in ai_result.get("recommendations", [])
    ]
    
    keywords_data = [
        KeywordData(
            keyword=k["keyword"],
            count=k["count"],
            density=k["density"],
            is_stuffed=k["is_stuffed"],
            position=k["position"]
        )
        for k in keywords
    ]
    
    ai_data = {
        "summary": ai_result.get("summary", ""),
        "tone": ai_result.get("tone", "Neutre"),
        "target_audience": ai_result.get("target_audience", "Général"),
        "strengths": ai_result.get("strengths", []),
        "weaknesses": ai_result.get("weaknesses", [])
    }
    ai_analysis_str = json.dumps(ai_data)
        
    title = request.title or "Analyse sans titre"
    if not request.title and metadata:
        title = metadata.get("title") or "Analyse sans titre"
        
    analysis = Analysis(
        user_id=current_user.id,
        title=title[:100],
        content_type="text",
        original_content=content[:10000],
        seo_score=seo_score,
        readability_score=readability_score,
        keywords_data=[k.model_dump() for k in keywords_data],
        recommendations=[r.model_dump() for r in recommendations],
        metadata_suggestions=metadata,
        ai_analysis=ai_analysis_str,
        created_at=datetime.utcnow()
    )
    
    # Deduct 1 credit
    if current_user.role != "admin":
        current_user.credits = cast(int, current_user.credits) - 1  # type: ignore[assignment]
    db.add(analysis)
    db.commit()
    db.refresh(analysis)
    db.refresh(current_user)
    
    return AnalysisResponse(
        id=cast(int, analysis.id),
        seo_score=seo_score,
        readability_score=readability_score,
        content_structure=ContentStructure(**structure),
        keywords=keywords_data,
        recommendations=recommendations,
        metadata_suggestions=MetadataSuggestions(**metadata),
        ai_analysis=ai_analysis_str,
        created_at=cast(datetime, analysis.created_at)
    )

@router.post("/analyze-url", response_model=AnalysisResponse)
async def analyze_url(
    request: UrlAnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if user has sufficient credits (tokens)
    if current_user.role != "admin" and (current_user.credits is None or current_user.credits <= 0):
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Solde de jetons insuffisant. Veuillez acheter des jetons pour continuer."
        )
            
    url = str(request.url)
    
    if not url.startswith(("http://", "https://")):
        raise HTTPException(status_code=400, detail="URL invalide")
    
    scrape_result = await scrape_url(url)
    
    if not scrape_result.get("success"):
        raise HTTPException(status_code=400, detail=scrape_result.get("error", "Erreur lors du scraping"))
    
    content = scrape_result.get("content", "")
    
    if len(content) < 50:
        raise HTTPException(status_code=400, detail="Contenu insuffisant pour l'analyse")
    
    keywords = extract_keywords(content)
    structure = analyze_structure(content)
    readability_score = calculate_readability_score(content)
    
    ai_result = await generate_seo_analysis(content, keywords, structure)
    
    metadata = await generate_metadata(content, keywords)
    
    seo_score = ai_result.get("score", 50)
    
    recommendations = [
        Recommendation(
            type=rec.get("type", "general"),
            priority=rec.get("priority", "medium"),
            title=rec.get("title", ""),
            description=rec.get("description", ""),
            suggestion=rec.get("suggestion")
        )
        for rec in ai_result.get("recommendations", [])
    ]
    
    keywords_data = [
        KeywordData(
            keyword=k["keyword"],
            count=k["count"],
            density=k["density"],
            is_stuffed=k["is_stuffed"],
            position=k["position"]
        )
        for k in keywords
    ]
    
    ai_data = {
        "summary": ai_result.get("summary", ""),
        "tone": ai_result.get("tone", "Neutre"),
        "target_audience": ai_result.get("target_audience", "Général"),
        "strengths": ai_result.get("strengths", []),
        "weaknesses": ai_result.get("weaknesses", [])
    }
    ai_analysis_str = json.dumps(ai_data)
        
    analysis = Analysis(
        user_id=current_user.id,
        title=(scrape_result.get("title") or "Analyse URL")[:100],
        content_type="url",
        original_content=content[:10000],
        url_analyzed=url,
        seo_score=seo_score,
        readability_score=readability_score,
        keywords_data=[k.model_dump() for k in keywords_data],
        recommendations=[r.model_dump() for r in recommendations],
        metadata_suggestions=metadata,
        ai_analysis=ai_analysis_str,
        created_at=datetime.utcnow()
    )
    
    # Deduct 1 credit
    if current_user.role != "admin":
        current_user.credits = cast(int, current_user.credits) - 1  # type: ignore[assignment]
    db.add(analysis)
    db.commit()
    db.refresh(analysis)
    db.refresh(current_user)
    
    return AnalysisResponse(
        id=cast(int, analysis.id),
        seo_score=seo_score,
        readability_score=readability_score,
        content_structure=ContentStructure(**structure),
        keywords=keywords_data,
        recommendations=recommendations,
        metadata_suggestions=MetadataSuggestions(**metadata),
        ai_analysis=ai_analysis_str,
        created_at=cast(datetime, analysis.created_at)
    )

@router.get("/history", response_model=AnalysisHistoryResponse)
async def get_analysis_history(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    bookmarked_only: bool = Query(False),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Analysis).filter(Analysis.user_id == current_user.id)
    
    if bookmarked_only:
        query = query.filter(Analysis.is_bookmarked == True)
    
    total = query.count()
    analyses = query.order_by(Analysis.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    
    return AnalysisHistoryResponse(
        total=total,
        page=page,
        page_size=page_size,
        analyses=analyses
    )

@router.get("/analysis/{analysis_id}", response_model=AnalysisResponse)
async def get_analysis_detail(
    analysis_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == "admin":
        analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    else:
        analysis = db.query(Analysis).filter(
            Analysis.id == analysis_id,
            Analysis.user_id == current_user.id
        ).first()
    
    if not analysis:
        raise HTTPException(status_code=404, detail="Analyse non trouvée")
    
    keywords_raw: list[dict[str, Any]] = cast(list[dict[str, Any]], analysis.keywords_data) or []
    recommendations_raw: list[dict[str, Any]] = cast(list[dict[str, Any]], analysis.recommendations) or []
    keywords = [KeywordData(**k) for k in keywords_raw]
    recommendations = [Recommendation(**r) for r in recommendations_raw]
    
    structure_data = analyze_structure(cast(str, analysis.original_content))
    
    metadata_raw = cast(Optional[dict[str, Any]], analysis.metadata_suggestions)
    
    return AnalysisResponse(
        id=cast(int, analysis.id),
        seo_score=cast(float, analysis.seo_score) or 0,
        readability_score=cast(float, analysis.readability_score) or 0,
        content_structure=ContentStructure(**structure_data),
        keywords=keywords,
        recommendations=recommendations,
        metadata_suggestions=MetadataSuggestions(**metadata_raw) if metadata_raw else MetadataSuggestions(title="", meta_description="", focus_keyword=""),
        ai_analysis=cast(str, analysis.ai_analysis) or "",
        created_at=cast(datetime, analysis.created_at)
    )

@router.patch("/analysis/{analysis_id}/bookmark")
async def update_bookmark(
    analysis_id: int,
    bookmark_data: BookmarkUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    analysis = db.query(Analysis).filter(
        Analysis.id == analysis_id,
        Analysis.user_id == current_user.id
    ).first()
    
    if not analysis:
        raise HTTPException(status_code=404, detail="Analyse non trouvée")
    
    analysis.is_bookmarked = bookmark_data.is_bookmarked  # type: ignore[assignment]
    db.commit()
    
    return {"message": "Bookmark mis à jour"}

@router.delete("/analysis/{analysis_id}")
async def delete_analysis(
    analysis_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    analysis = db.query(Analysis).filter(
        Analysis.id == analysis_id,
        Analysis.user_id == current_user.id
    ).first()
    
    if not analysis:
        raise HTTPException(status_code=404, detail="Analyse non trouvée")
    
    db.delete(analysis)
    db.commit()
    
    return {"message": "Analyse supprimée"}

@router.get("/suggestions/{analysis_id}")
async def get_suggestions(
    analysis_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == "admin":
        analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    else:
        analysis = db.query(Analysis).filter(
            Analysis.id == analysis_id,
            Analysis.user_id == current_user.id
        ).first()
    
    if not analysis:
        raise HTTPException(status_code=404, detail="Analyse non trouvée")
    
    keywords_list: list[dict[str, Any]] = cast(list[dict[str, Any]], analysis.keywords_data) or []
    primary_keyword: str = keywords_list[0]["keyword"] if keywords_list else "contenu"
    
    suggestions = await suggest_reformulations(cast(str, analysis.original_content), primary_keyword)
    
    return {"suggestions": suggestions}
