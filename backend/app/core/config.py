
from typing import List
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, validator
import os


class Settings(BaseSettings):
    # API Configuration
    API_V1_PREFIX: str = "/api"
    PROJECT_NAME: str = "StudyBuddy AI"
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Database Configuration
    DATABASE_URL: str
    
    # Security Configuration
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS Configuration
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8000"
    ]
    
    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v
    
    # OpenAI Configuration
    OPENAI_API_KEY: str
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL")
    OPENAI_MAX_TOKENS: int = os.getenv("OPENAI_MAX_TOKENS")
    OPENAI_TEMPERATURE: float = os.getenv("OPENAI_TEMPERATURE")
    
    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'
        case_sensitive = True
        env_prefix = ""


# Create global settings instance
settings = Settings()

