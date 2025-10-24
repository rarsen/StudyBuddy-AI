
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from app.core.config import settings
from app.api.v1.api import api_router
from app.db.session import engine
from app.db.base import Base
from app.db import models  # Import models so SQLAlchemy knows about them

# Configure logging
logging.basicConfig(
    level=logging.INFO if settings.DEBUG else logging.WARNING,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


def create_application() -> FastAPI:
    application = FastAPI(
        title=settings.PROJECT_NAME,
        description="AI-powered educational assistant helping students with exam preparation",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url=f"{settings.API_V1_PREFIX}/openapi.json"
    )

    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    application.include_router(api_router, prefix=settings.API_V1_PREFIX)

    return application


app = create_application()


@app.on_event("startup")
async def startup_event():
    logger.info(f"Starting {settings.PROJECT_NAME}")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    try:
        Base.metadata.create_all(bind=engine)
        table_names = [table.name for table in Base.metadata.sorted_tables]
        logger.info(f"Database tables initialized: {', '.join(table_names)}")
    except Exception as e:
        logger.error(f"Failed to initialize database: {str(e)}")
        raise

@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Welcome to StudyBuddy AI API",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs"
    }


@app.get("/debug/config", tags=["Debug"])
async def debug_config():
    return {
        "environment": settings.ENVIRONMENT,
        "debug": settings.DEBUG,
        "secret_key_set": bool(settings.SECRET_KEY),
        "secret_key_length": len(settings.SECRET_KEY) if settings.SECRET_KEY else 0,
        "secret_key_preview": settings.SECRET_KEY[:15] + "..." if settings.SECRET_KEY and len(settings.SECRET_KEY) > 15 else "NOT_SET",
        "algorithm": settings.ALGORITHM,
        "token_expire_minutes": settings.ACCESS_TOKEN_EXPIRE_MINUTES,
        "openai_key_set": bool(settings.OPENAI_API_KEY and not settings.OPENAI_API_KEY.endswith("here")),
        "database_url_set": bool(settings.DATABASE_URL)
    }


@app.get("/health", tags=["Health"])
async def health_check():
    from sqlalchemy import inspect
    
    try:
        inspector = inspect(engine)
        table_names = inspector.get_table_names()
        db_connected = True
    except Exception as e:
        table_names = []
        db_connected = False
        logger.error(f"Database connection check failed: {str(e)}")
    
    return {
        "status": "healthy" if db_connected else "unhealthy",
        "environment": settings.ENVIRONMENT,
        "database": {
            "connected": db_connected,
            "tables": table_names
        }
    }

