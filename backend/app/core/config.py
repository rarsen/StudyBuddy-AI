
from typing import List, Union
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
import os


class Settings(BaseSettings):
    # API Configuration
    API_V1_PREFIX: str = "/api"
    PROJECT_NAME: str = "MindSpark"

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
    BACKEND_CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8000",
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v

    # OpenAI Configuration
    OPENAI_API_KEY: str
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4.1-nano")
    OPENAI_MAX_TOKENS: int = int(os.getenv("OPENAI_MAX_TOKENS", "1000"))
    OPENAI_TEMPERATURE: float = float(os.getenv("OPENAI_TEMPERATURE", "0.5"))

    # Embedding Configuration (RAG)
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")
    EMBEDDING_DIMENSIONS: int = int(os.getenv("EMBEDDING_DIMENSIONS", "1536"))
    RAG_CHUNK_SIZE_TOKENS: int = int(os.getenv("RAG_CHUNK_SIZE_TOKENS", "400"))
    RAG_CHUNK_OVERLAP_TOKENS: int = int(os.getenv("RAG_CHUNK_OVERLAP_TOKENS", "80"))
    RAG_TOP_K: int = int(os.getenv("RAG_TOP_K", "5"))
    # Cosine similarity floor: chunks below this are treated as "no match".
    # Mock embeddings are noisier, so the threshold is lower there.
    RAG_MIN_SCORE: float = float(os.getenv("RAG_MIN_SCORE", "0.25"))
    RAG_MIN_SCORE_MOCK: float = float(os.getenv("RAG_MIN_SCORE_MOCK", "0.05"))

    # Code-execution sandbox
    CODE_EXEC_TIMEOUT_S: int = int(os.getenv("CODE_EXEC_TIMEOUT_S", "4"))
    CODE_EXEC_MEMORY_MB: int = int(os.getenv("CODE_EXEC_MEMORY_MB", "128"))

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
