from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.db.models import User, UserRole
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash, verify_password


class UserService:
    
    @staticmethod
    def create_user(db: Session, user_data: UserCreate) -> User:
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        existing_username = db.query(User).filter(User.username == user_data.username).first()
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
        user = User(
            email=user_data.email,
            username=user_data.username,
            full_name=user_data.full_name,
            hashed_password=get_password_hash(user_data.password),
            role=UserRole.STUDENT,
            is_active=True
        )
        
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    
    @staticmethod
    def authenticate_user(db: Session, email_or_username: str, password: str) -> Optional[User]:
        user = db.query(User).filter(
            (User.email == email_or_username) | (User.username == email_or_username)
        ).first()
        
        if not user:
            return None
        
        if not verify_password(password, user.hashed_password):
            return None
        
        user.last_login = datetime.utcnow()
        db.commit()
        return user
    
    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
        return db.query(User).filter(User.id == user_id).first()
    
    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email).first()
    
    @staticmethod
    def update_user(db: Session, user: User, update_data: UserUpdate) -> User:
        update_dict = update_data.dict(exclude_unset=True)
        
        if "password" in update_dict:
            update_dict["hashed_password"] = get_password_hash(update_dict.pop("password"))
        
        if "email" in update_dict and update_dict["email"] != user.email:
            existing = db.query(User).filter(User.email == update_dict["email"]).first()
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )
        
        if "username" in update_dict and update_dict["username"] != user.username:
            existing = db.query(User).filter(User.username == update_dict["username"]).first()
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username already taken"
                )
        
        for field, value in update_dict.items():
            setattr(user, field, value)
        
        db.commit()
        db.refresh(user)
        return user


user_service = UserService()

