# SEO Assistant - Intelligent SEO Optimization Tool

Assistant d'optimisation SEO intelligent basé sur l'IA.

## Stack Technique

- **Backend**: Python 3.11+, FastAPI, SQLAlchemy, PostgreSQL
- **Frontend**: React 18, Vite, Tailwind CSS
- **IA**: Google Gemini, spaCy
- **Base de données**: PostgreSQL
- **Conteneurisation**: Docker, Docker Compose

## Installation

### Avec Docker (Recommandé)

```bash
# Cloner le projet
cd seo-assistant

# Copier et configurer les variables d'environnement
cp backend/.env.example backend/.env
# Modifier le fichier .env avec vos clés API

# Lancer avec Docker Compose
docker-compose up --build
```

L'application sera accessible sur:
- Frontend: http://localhost:5173
- API: http://localhost:8000
- Swagger Docs: http://localhost:8000/docs

### Installation Manuelle

#### Backend

```bash
cd backend

# Créer un environnement virtuel
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou: venv\Scripts\activate  # Windows

# Installer les dépendances
pip install -r requirements.txt

# Télécharger le modèle spaCy
python -m spacy download fr_core_news_lg
# ou: python -m spacy download en_core_news_lg

# Configurer la base de données
# Éditer .env avec vos paramètres

# Lancer le serveur
uvicorn main:app --reload
```

#### Frontend

```bash
cd frontend

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

## Configuration

### Variables d'environnement Backend (.env)

```env
DATABASE_URL=postgresql://user:password@localhost:5432/seo_assistant
SECRET_KEY=votre-cle-secrete
GEMINI_API_KEY=votre-cle-api-gemini
GEMINI_MODEL=gemini-1.5-pro
```

## Fonctionnalités

- Analyse SEO de textes et URLs
- Extraction automatique de mots-clés
- Calcul de densité des mots-clés
- Détection de keyword stuffing
- Génération de métadonnées optimisées (Title, Meta description)
- Analyse de structure de contenu (H1, H2, H3)
- Score de lisibilité
- Recommandations IA personnalisées
- Historique des analyses
- Marque-pages et favoris

## API Endpoints

### Authentification
- `POST /api/v1/auth/register` - Inscription
- `POST /api/v1/auth/login` - Connexion
- `POST /api/v1/auth/refresh` - Rafraîchir le token
- `GET /api/v1/auth/me` - Utilisateur courant

### Analyse SEO
- `POST /api/v1/seo/analyze-text` - Analyser un texte
- `POST /api/v1/seo/analyze-url` - Analyser une URL
- `GET /api/v1/seo/history` - Historique des analyses
- `GET /api/v1/seo/analysis/{id}` - Détails d'une analyse
- `PATCH /api/v1/seo/analysis/{id}/bookmark` - Marquer en favori
- `DELETE /api/v1/seo/analysis/{id}` - Supprimer une analyse

## Licence

Projet de Fin d'Études - 2025
