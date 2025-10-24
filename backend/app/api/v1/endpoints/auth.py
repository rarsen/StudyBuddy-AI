from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.user import UserCreate, UserLogin, TokenResponse
from app.services.user_service import user_service
from app.core.security import create_access_token

router = APIRouter()


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
)
def register(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    user = user_service.create_user(db, user_data)
    access_token = create_access_token(data={"sub": str(user.id)})
    from app.schemas.user import UserResponse
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.from_orm(user)
    )


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login with existing account",
)
def login(
    login_data: UserLogin,
    db: Session = Depends(get_db)
):
    user = user_service.authenticate_user(
        db,
        login_data.email_or_username,
        login_data.password
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email/username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive"
        )
    access_token = create_access_token(data={"sub": str(user.id)})
    from app.schemas.user import UserResponse
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.from_orm(user)
    )

