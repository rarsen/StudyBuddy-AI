"""
Chat schemas for request/response validation
Pydantic models for chat-related API operations
"""

from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import List, Optional
from app.db.models import MessageRole, Subject


class MessageBase(BaseModel):
    """Base message schema"""
    content: str = Field(..., min_length=1, max_length=5000)


class MessageCreate(MessageBase):
    """
    Schema for creating a new chat message
    User sends a question/message to the AI
    """
    session_id: Optional[int] = None
    subject: Optional[Subject] = None


class MessageResponse(MessageBase):
    """
    Schema for message response data
    Includes metadata about the message and AI response
    """
    id: int
    session_id: int
    role: MessageRole
    tokens_used: Optional[int] = None
    model_used: Optional[str] = None
    response_time: Optional[int] = None
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
        protected_namespaces=()
    )


class ChatSessionCreate(BaseModel):
    """
    Schema for creating a new chat session
    Optional title and subject for organization
    """
    title: Optional[str] = Field("New Study Session", max_length=255)
    subject: Optional[Subject] = Subject.OTHER


class ChatSessionUpdate(BaseModel):
    """
    Schema for updating chat session metadata
    All fields are optional for partial updates
    """
    title: Optional[str] = Field(None, max_length=255)
    subject: Optional[Subject] = None
    is_active: Optional[bool] = None


class ChatSessionResponse(BaseModel):
    """
    Schema for chat session response data
    Includes session metadata and optionally messages
    """
    id: int
    user_id: int
    title: str
    subject: Subject
    is_active: bool
    message_count: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    messages: Optional[List[MessageResponse]] = None

    model_config = ConfigDict(from_attributes=True)


class ChatResponse(BaseModel):
    """
    Schema for AI chat response
    Contains both user message and AI response
    """
    session_id: int
    user_message: MessageResponse
    assistant_message: MessageResponse

