from pydantic_settings import BaseSettings
from typing import Any, Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "SEO Assistant API"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api/v1"
    
    DATABASE_URL: str = "sqlite:///./seo_assistant.db"
    
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4o"
    
    GOOGLE_API_KEY: Optional[str] = None
    GOOGLE_MODEL: str = "gemini-1.5-flash"
    GOOGLE_BASE_URL: str = "https://generativelanguage.googleapis.com/v1beta/models"
    
    STRIPE_PUBLIC_KEY: Optional[str] = None
    STRIPE_SECRET_KEY: Optional[str] = None
    
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000", "http://localhost", "http://localhost:8081", "http://127.0.0.1:8081", "http://127.0.0.1:5173"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

    @classmethod
    def parse_cors(cls, v: Any) -> list[str]:
        if isinstance(v, str) and v.startswith("[") and v.endswith("]"):
            import json
            return json.loads(v)
        return v

settings = Settings()
