from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from typing import cast
from database import get_db
from models.user import User, UserRole
from schemas.user import UserCreate, UserResponse, UserLogin, Token, TokenRefresh, PasswordChange
from core.security import (
    get_password_hash, verify_password, 
    create_access_token, create_refresh_token, verify_token,
    get_current_user
)
from core.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == user_data.username).first():
        raise HTTPException(status_code=400, detail="Nom d'utilisateur déjà pris")
    
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email déjà utilisé")
    
    user = User(
        username=user_data.username,
        email=user_data.email,
        full_name=user_data.full_name,
        hashed_password=get_password_hash(user_data.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    
    if not user or not verify_password(form_data.password, cast(str, user.hashed_password)):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nom d'utilisateur ou mot de passe incorrect",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Compte désactivé")
    
    # Update last login
    user.last_login = datetime.now(timezone.utc)  # type: ignore[assignment]
    db.commit()
    
    access_token = create_access_token(data={"sub": user.username})
    refresh_token = create_refresh_token(data={"sub": user.username})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/refresh", response_model=Token)
async def refresh_token(token_data: TokenRefresh, db: Session = Depends(get_db)):
    username = verify_token(token_data.refresh_token, "refresh")
    if not username:
        raise HTTPException(status_code=401, detail="Token de rafraîchissement invalide")
    
    user = db.query(User).filter(User.username == username).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Utilisateur invalide")
    
    access_token = create_access_token(data={"sub": user.username})
    new_refresh_token = create_refresh_token(data={"sub": user.username})
    
    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    current_user.analysis_count = len(list(current_user.analyses))  # type: ignore[arg-type]
    return current_user

@router.post("/change-password")
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not verify_password(password_data.current_password, cast(str, current_user.hashed_password)):
        raise HTTPException(status_code=400, detail="Mot de passe actuel incorrect")
    
    current_user.hashed_password = get_password_hash(password_data.new_password)  # type: ignore[assignment]
    db.commit()
    return {"message": "Mot de passe modifié avec succès"}

@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    return {"message": "Déconnexion réussie"}
