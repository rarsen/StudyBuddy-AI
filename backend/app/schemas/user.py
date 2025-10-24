"""
User schemas for request/response validation
Pydantic models for user-related API operations
"""

from pydantic import BaseModel, EmailStr, Field, ConfigDict
from datetime import datetime
from typing import Optional
from app.db.models import UserRole


class UserBase(BaseModel):
    """Base user schema with common fields"""
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=100)
    full_name: Optional[str] = Field(None, max_length=255)


class UserCreate(UserBase):
    """
    Schema for user registration
    Requires password field for account creation
    """
    password: str = Field(..., min_length=8, max_length=100)


class UserLogin(BaseModel):
    """
    Schema for user login
    Supports login with either email or username
    """
    email_or_username: str
    password: str


class UserUpdate(BaseModel):
    """
    Schema for updating user profile
    All fields are optional for partial updates
    """
    email: Optional[EmailStr] = None
    username: Optional[str] = Field(None, min_length=3, max_length=100)
    full_name: Optional[str] = Field(None, max_length=255)
    password: Optional[str] = Field(None, min_length=8, max_length=100)


class UserResponse(UserBase):
    """
    Schema for user response data
    Includes database-generated fields
    """
    id: int
    role: UserRole
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    """
    Schema for authentication token response
    Returned after successful login
    """
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

