import stripe
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from core.security import get_current_user
from core.config import settings
from typing import cast, TypedDict

router = APIRouter(prefix="/payment", tags=["Payment"])

class PlanInfo(TypedDict):
    name: str
    description: str
    price: int
    credits: int

# Definition of token packages: 1 for 5 EUR, 3 for 10 EUR, 10 for 20 EUR
PLANS: dict[str, PlanInfo] = {
    "1_token": {
        "name": "1 Jeton SEO",
        "description": "Crédit pour 1 analyse SEO complète et conseils IA",
        "price": 500,  # 5.00 EUR
        "credits": 1
    },
    "3_tokens": {
        "name": "3 Jetons SEO",
        "description": "Crédit pour 3 analyses SEO complètes et conseils IA",
        "price": 1000,  # 10.00 EUR
        "credits": 3
    },
    "10_tokens": {
        "name": "10 Jetons SEO",
        "description": "Crédit pour 10 analyses SEO complètes et conseils IA",
        "price": 2000,  # 20.00 EUR
        "credits": 10
    }
}

@router.post("/create-checkout-session")
async def create_checkout_session(
    request: Request,
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not settings.STRIPE_SECRET_KEY:
        raise HTTPException(status_code=500, detail="Clé secrète Stripe non configurée")
        
    stripe.api_key = settings.STRIPE_SECRET_KEY
    
    plan_id = payload.get("plan_id", "3_tokens")
    if plan_id not in PLANS:
        raise HTTPException(status_code=400, detail="Plan de paiement invalide")
        
    plan = PLANS[plan_id]
    
    # Récupérer l'origine de la requête pour rediriger dynamiquement
    origin = request.headers.get("origin") or "http://localhost:5173"
    
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'eur',
                    'product_data': {
                        'name': plan["name"],
                        'description': plan["description"],
                    },
                    'unit_amount': plan["price"],
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=f"{origin}/payment/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{origin}/pricing",
            client_reference_id=str(current_user.id),
            customer_email=cast(str, current_user.email),
            metadata={
                "credits_to_add": str(plan["credits"]),
                "plan_id": plan_id
            }
        )
        return {"id": session.id, "url": session.url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/verify-checkout-session")
async def verify_checkout_session(
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session_id = payload.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="ID de session Stripe requis")
        
    if not settings.STRIPE_SECRET_KEY:
        raise HTTPException(status_code=500, detail="Clé secrète Stripe non configurée")
        
    stripe.api_key = settings.STRIPE_SECRET_KEY
    
    try:
        session = stripe.checkout.Session.retrieve(session_id)
        if session.payment_status == "paid":
            # Vérifier que la session correspond bien à l'utilisateur actuel
            if str(current_user.id) != session.client_reference_id:
                raise HTTPException(status_code=403, detail="Session non autorisée pour cet utilisateur")
                
            # Mettre à jour les crédits de l'utilisateur
            user = db.query(User).filter(User.id == current_user.id).first()
            if user:
                # stripe v15: StripeObject no longer inherits from dict
                # Use bracket notation instead of .get()
                try:
                    metadata = session.metadata
                    if metadata is None:
                        credits_to_add = 0
                    else:
                        credits_to_add = int(metadata["credits_to_add"])
                except (KeyError, TypeError):
                    credits_to_add = 0
                user.credits = (cast(int, user.credits) or 0) + credits_to_add  # type: ignore[assignment]
                db.commit()
                db.refresh(user)
                return {
                    "success": True, 
                    "message": f"{credits_to_add} jeton(s) ajouté(s) avec succès",
                    "user": {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email,
                        "is_premium": user.is_premium,
                        "credits": user.credits
                    }
                }
                
        raise HTTPException(status_code=400, detail="Paiement non complété")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
