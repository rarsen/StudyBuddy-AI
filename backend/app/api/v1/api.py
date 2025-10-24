from fastapi import APIRouter

from app.api.v1.endpoints import auth, chat, users

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(chat.router, prefix="/chat", tags=["Chat"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])

