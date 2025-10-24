from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import User
from app.core.security import get_current_user
from app.schemas.user import UserResponse, UserUpdate
from app.services.user_service import user_service

router = APIRouter()


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current user profile",
)
def get_current_user_profile(
    current_user: User = Depends(get_current_user)
):
    return UserResponse.from_orm(current_user)


@router.patch(
    "/me",
    response_model=UserResponse,
    summary="Update current user profile",
)
def update_current_user_profile(
    update_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = user_service.update_user(db, current_user, update_data)
    return UserResponse.from_orm(user)

