from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from database import get_db
from models.user import User, UserRole
from models.analysis import Analysis
from schemas.user import UserResponse
from core.security import get_current_user
from typing import List, Dict, Any, cast, Optional
from datetime import datetime

router = APIRouter(prefix="/admin", tags=["Admin Operations"])

async def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès refusé. Privilèges administrateur requis."
        )
    return current_user

@router.get("/stats", response_model=Dict[str, Any])
async def get_admin_stats(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    total_users = db.query(User).count()
    total_analyses = db.query(Analysis).count()
    
    # Calculate average SEO score
    analyses = db.query(Analysis).all()
    avg_score: float = 0
    if total_analyses > 0:
        scores_sum = sum(cast(float, a.seo_score) or 0 for a in analyses)
        avg_score = round(scores_sum / total_analyses, 1)
        
    # Content type breakdown
    text_count = db.query(Analysis).filter(Analysis.content_type == "text").count()
    url_count = db.query(Analysis).filter(Analysis.content_type == "url").count()
    
    return {
        "total_users": total_users,
        "total_analyses": total_analyses,
        "average_seo_score": avg_score,
        "breakdown": {
            "text": text_count,
            "url": url_count
        }
    }

@router.get("/users", response_model=List[UserResponse])
async def get_all_users(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    users = db.query(User).order_by(User.created_at.desc()).all()
    return users

@router.patch("/users/{user_id}/toggle-active")
async def toggle_user_active(
    user_id: int,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    if user_id == admin.id:
        raise HTTPException(
            status_code=400,
            detail="Vous ne pouvez pas désactiver votre propre compte administrateur."
        )
        
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
        
    user.is_active = not cast(bool, user.is_active)  # type: ignore[assignment]
    db.commit()
    db.refresh(user)
    
    status_str = "activé" if user.is_active else "désactivé"
    return {"message": f"Compte de l'utilisateur {status_str} avec succès", "is_active": user.is_active}

@router.patch("/users/{user_id}/role")
async def update_user_role(
    user_id: int,
    new_role: str,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    if user_id == admin.id:
        raise HTTPException(
            status_code=400,
            detail="Vous ne pouvez pas modifier votre propre rôle administrateur."
        )
        
    if new_role not in [UserRole.USER, UserRole.ADMIN]:
        raise HTTPException(status_code=400, detail="Rôle invalide")
        
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
        
    user.role = UserRole(new_role)  # type: ignore[assignment]
    db.commit()
    db.refresh(user)
    
    return {"message": f"Rôle mis à jour vers {new_role} avec succès", "role": user.role}

@router.get("/analyses", response_model=List[Dict[str, Any]])
async def get_all_analyses(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=5000),
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = db.query(Analysis).join(User)
    total = query.count()
    analyses = query.order_by(Analysis.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    
    results = []
    for a in analyses:
        results.append({
            "id": a.id,
            "title": a.title,
            "content_type": a.content_type,
            "seo_score": a.seo_score,
            "readability_score": a.readability_score,
            "created_at": a.created_at,
            "user": {
                "id": a.user.id,
                "username": a.user.username,
                "email": a.user.email
            }
        })
        
    return results

@router.delete("/analyses/{analysis_id}")
async def delete_any_analysis(
    analysis_id: int,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analyse non trouvée")
        
    db.delete(analysis)
    db.commit()
    
    return {"message": "Analyse supprimée par l'administrateur avec succès"}
