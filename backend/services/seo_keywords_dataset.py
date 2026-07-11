# Dataset of curated high-value professional SEO keywords across major domains in French
from typing import Dict

SEO_DOMAINS_DATASET: Dict[str, Dict] = {
    "education": {
        "name": "Éducation & Formation",
        "icon": "🎓",
        "keywords": [
            {"keyword": "école privée", "volume": "10k - 20k", "competition": "Moyenne"},
            {"keyword": "formation professionnelle", "volume": "20k - 50k", "competition": "Élevée"},
            {"keyword": "cours en ligne", "volume": "50k - 100k", "competition": "Élevée"},
            {"keyword": "études supérieures", "volume": "5k - 10k", "competition": "Moyenne"},
            {"keyword": "soutien scolaire", "volume": "10k - 20k", "competition": "Moyenne"},
            {"keyword": "école de commerce", "volume": "10k - 30k", "competition": "Élevée"},
            {"keyword": "formation continue", "volume": "2k - 5k", "competition": "Faible"},
            {"keyword": "reconversion professionnelle", "volume": "5k - 15k", "competition": "Moyenne"},
            {"keyword": "orientation scolaire", "volume": "2k - 5k", "competition": "Moyenne"},
            {"keyword": "diplôme accrédité", "volume": "1k - 3k", "competition": "Faible"}
        ]
    },
    "tech": {
        "name": "Technologie, SaaS & IA",
        "icon": "💻",
        "keywords": [
            {"keyword": "logiciel saas", "volume": "1k - 5k", "competition": "Moyenne"},
            {"keyword": "intelligence artificielle", "volume": "100k - 300k", "competition": "Élevée"},
            {"keyword": "cybersécurité", "volume": "10k - 25k", "competition": "Élevée"},
            {"keyword": "application mobile", "volume": "10k - 20k", "competition": "Moyenne"},
            {"keyword": "développement web", "volume": "20k - 50k", "competition": "Élevée"},
            {"keyword": "transformation digitale", "volume": "1k - 5k", "competition": "Moyenne"},
            {"keyword": "cloud computing", "volume": "5k - 10k", "competition": "Moyenne"},
            {"keyword": "solution CRM", "volume": "2k - 5k", "competition": "Élevée"},
            {"keyword": "hébergement web", "volume": "10k - 20k", "competition": "Élevée"},
            {"keyword": "outils collaboratifs", "volume": "1k - 5k", "competition": "Faible"}
        ]
    },
    "immobilier": {
        "name": "Immobilier & Logement",
        "icon": "🏠",
        "keywords": [
            {"keyword": "achat appartement", "volume": "50k - 100k", "competition": "Élevée"},
            {"keyword": "location maison", "volume": "50k - 100k", "competition": "Élevée"},
            {"keyword": "agence immobilière", "volume": "100k - 200k", "competition": "Élevée"},
            {"keyword": "investissement locatif", "volume": "10k - 20k", "competition": "Moyenne"},
            {"keyword": "crédit immobilier", "volume": "20k - 50k", "competition": "Élevée"},
            {"keyword": "estimation immobilière", "volume": "5k - 15k", "competition": "Moyenne"},
            {"keyword": "promoteur immobilier", "volume": "5k - 10k", "competition": "Moyenne"},
            {"keyword": "immobilier de luxe", "volume": "2k - 5k", "competition": "Moyenne"},
            {"keyword": "gestion locative", "volume": "5k - 10k", "competition": "Moyenne"}
        ]
    },
    "sante": {
        "name": "Santé, Bien-être & Beauté",
        "icon": "🩺",
        "keywords": [
            {"keyword": "cabinet médical", "volume": "5k - 10k", "competition": "Moyenne"},
            {"keyword": "médecine douce", "volume": "2k - 5k", "competition": "Faible"},
            {"keyword": "compléments alimentaires", "volume": "10k - 30k", "competition": "Élevée"},
            {"keyword": "nutritionniste", "volume": "10k - 20k", "competition": "Moyenne"},
            {"keyword": "perte de poids", "volume": "20k - 50k", "competition": "Élevée"},
            {"keyword": "santé mentale", "volume": "10k - 20k", "competition": "Moyenne"},
            {"keyword": "soins de la peau", "volume": "5k - 15k", "competition": "Élevée"},
            {"keyword": "cosmétiques bio", "volume": "5k - 15k", "competition": "Élevée"},
            {"keyword": "remise en forme", "volume": "2k - 5k", "competition": "Moyenne"}
        ]
    },
    "finance": {
        "name": "Finance, Banque & Assurances",
        "icon": "🪙",
        "keywords": [
            {"keyword": "gestion de patrimoine", "volume": "5k - 10k", "competition": "Moyenne"},
            {"keyword": "assurance vie", "volume": "20k - 50k", "competition": "Élevée"},
            {"keyword": "crédit en ligne", "volume": "10k - 30k", "competition": "Élevée"},
            {"keyword": "courtier en assurance", "volume": "5k - 15k", "competition": "Moyenne"},
            {"keyword": "investissement en bourse", "volume": "5k - 15k", "competition": "Moyenne"},
            {"keyword": "fiscalité", "volume": "10k - 20k", "competition": "Moyenne"},
            {"keyword": "comparateur de crédit", "volume": "10k - 20k", "competition": "Élevée"},
            {"keyword": "épargne retraite", "volume": "2k - 5k", "competition": "Moyenne"},
            {"keyword": "crypto-monnaies", "volume": "50k - 100k", "competition": "Élevée"}
        ]
    },
    "ecommerce": {
        "name": "E-commerce & Mode",
        "icon": "🛍️",
        "keywords": [
            {"keyword": "boutique en ligne", "volume": "10k - 20k", "competition": "Élevée"},
            {"keyword": "prêt-à-porter", "volume": "20k - 50k", "competition": "Élevée"},
            {"keyword": "mode écoresponsable", "volume": "2k - 5k", "competition": "Faible"},
            {"keyword": "achat en ligne", "volume": "50k - 100k", "competition": "Élevée"},
            {"keyword": "produits bio", "volume": "10k - 20k", "competition": "Moyenne"},
            {"keyword": "livraison rapide", "volume": "5k - 10k", "competition": "Moyenne"},
            {"keyword": "cadeau original", "volume": "20k - 50k", "competition": "Élevée"}
        ]
    },
    "tourisme": {
        "name": "Tourisme, Voyage & Hôtellerie",
        "icon": "✈️",
        "keywords": [
            {"keyword": "hôtel de luxe", "volume": "5k - 15k", "competition": "Élevée"},
            {"keyword": "voyage organisé", "volume": "10k - 20k", "competition": "Moyenne"},
            {"keyword": "guide de voyage", "volume": "5k - 10k", "competition": "Moyenne"},
            {"keyword": "location saisonnière", "volume": "10k - 30k", "competition": "Élevée"},
            {"keyword": "billets d'avion", "volume": "100k - 200k", "competition": "Élevée"},
            {"keyword": "tourisme écoresponsable", "volume": "1k - 3k", "competition": "Faible"},
            {"keyword": "séjour tout compris", "volume": "10k - 20k", "competition": "Élevée"},
            {"keyword": "randonnée guidée", "volume": "1k - 3k", "competition": "Faible"}
        ]
    },
    "restauration": {
        "name": "Restauration, Cuisine & Alimentation",
        "icon": "🍽️",
        "keywords": [
            {"keyword": "restaurant gastronomique", "volume": "10k - 25k", "competition": "Élevée"},
            {"keyword": "livraison de repas", "volume": "50k - 100k", "competition": "Élevée"},
            {"keyword": "recettes saines", "volume": "20k - 50k", "competition": "Moyenne"},
            {"keyword": "cuisine traditionnelle", "volume": "5k - 10k", "competition": "Moyenne"},
            {"keyword": "service traiteur", "volume": "5k - 15k", "competition": "Moyenne"},
            {"keyword": "brunch", "volume": "20k - 50k", "competition": "Élevée"},
            {"keyword": "produits locaux", "volume": "5k - 10k", "competition": "Faible"},
            {"keyword": "cours de cuisine", "volume": "5k - 10k", "competition": "Moyenne"}
        ]
    },
    "marketing": {
        "name": "Marketing, SEO & Communication",
        "icon": "📢",
        "keywords": [
            {"keyword": "agence de communication", "volume": "5k - 15k", "competition": "Élevée"},
            {"keyword": "stratégie marketing", "volume": "5k - 10k", "competition": "Moyenne"},
            {"keyword": "référencement naturel", "volume": "10k - 20k", "competition": "Élevée"},
            {"keyword": "publicité en ligne", "volume": "2k - 5k", "competition": "Moyenne"},
            {"keyword": "community management", "volume": "2k - 5k", "competition": "Moyenne"},
            {"keyword": "création de site web", "volume": "10k - 30k", "competition": "Élevée"},
            {"keyword": "audit SEO", "volume": "2k - 5k", "competition": "Moyenne"},
            {"keyword": "growth hacking", "volume": "1k - 3k", "competition": "Faible"}
        ]
    },
    "recrutement": {
        "name": "Recrutement, Emploi & Carrière",
        "icon": "💼",
        "keywords": [
            {"keyword": "offres d'emploi", "volume": "100k - 300k", "competition": "Élevée"},
            {"keyword": "cabinet de recrutement", "volume": "10k - 20k", "competition": "Élevée"},
            {"keyword": "recherche d'emploi", "volume": "20k - 50k", "competition": "Moyenne"},
            {"keyword": "CV professionnel", "volume": "10k - 25k", "competition": "Moyenne"},
            {"keyword": "entretien d'embauche", "volume": "5k - 15k", "competition": "Moyenne"},
            {"keyword": "intérim", "volume": "50k - 100k", "competition": "Élevée"},
            {"keyword": "fiche de poste", "volume": "5k - 10k", "competition": "Faible"}
        ]
    },
    "artisanat": {
        "name": "Artisanat, BTP & Services",
        "icon": "🛠️",
        "keywords": [
            {"keyword": "dépannage plomberie", "volume": "5k - 10k", "competition": "Élevée"},
            {"keyword": "entreprise de rénovation", "volume": "5k - 15k", "competition": "Élevée"},
            {"keyword": "électricien urgence", "volume": "5k - 10k", "competition": "Élevée"},
            {"keyword": "travaux maison", "volume": "10k - 20k", "competition": "Moyenne"},
            {"keyword": "artisan local", "volume": "1k - 5k", "competition": "Faible"},
            {"keyword": "ménage à domicile", "volume": "10k - 20k", "competition": "Moyenne"},
            {"keyword": "garde d'enfants", "volume": "10k - 30k", "competition": "Moyenne"}
        ]
    },
    "sport": {
        "name": "Sport, Fitness & Loisirs",
        "icon": "🏃",
        "keywords": [
            {"keyword": "salle de sport", "volume": "50k - 100k", "competition": "Élevée"},
            {"keyword": "programme musculation", "volume": "10k - 30k", "competition": "Moyenne"},
            {"keyword": "coach sportif", "volume": "10k - 20k", "competition": "Moyenne"},
            {"keyword": "équipement de sport", "volume": "5k - 15k", "competition": "Élevée"},
            {"keyword": "cours de yoga", "volume": "10k - 25k", "competition": "Moyenne"},
            {"keyword": "loisirs créatifs", "volume": "20k - 50k", "competition": "Moyenne"},
            {"keyword": "activités de plein air", "volume": "2k - 5k", "competition": "Faible"}
        ]
    }
}

def get_dataset_summary() -> str:
    """Returns a simplified text summary of domains and key keywords to be used in Gemini prompt context."""
    summary_parts = []
    for key, data in SEO_DOMAINS_DATASET.items():
        kw_list = [item["keyword"] for item in data["keywords"][:5]]
        summary_parts.append(f"- Domain '{key}' ({data['name']}): list of high-value keywords includes: {', '.join(kw_list)}")
    return "\n".join(summary_parts)
