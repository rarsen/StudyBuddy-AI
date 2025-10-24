import logging
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import User
from app.core.security import get_current_user
from app.schemas.chat import (
    ChatSessionCreate,
    ChatSessionResponse,
    ChatSessionUpdate,
    MessageCreate,
    MessageResponse,
    ChatResponse
)
from app.services.chat_service import chat_service

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post(
    "/sessions",
    response_model=ChatSessionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new chat session",
)
def create_session(
    session_data: ChatSessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = chat_service.create_session(db, current_user, session_data)
    return ChatSessionResponse.from_orm(session)


@router.get(
    "/sessions",
    response_model=List[ChatSessionResponse],
    summary="Get all user's chat sessions",
)
def get_sessions(
    skip: int = 0,
    limit: int = 100,
    active_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sessions = chat_service.get_user_sessions(
        db, current_user, skip, limit, active_only
    )
    return [ChatSessionResponse.from_orm(s) for s in sessions]


@router.get(
    "/sessions/{session_id}",
    response_model=ChatSessionResponse,
    summary="Get specific chat session",
)
def get_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = chat_service.get_session(db, session_id, current_user)
    return ChatSessionResponse.from_orm(session)


@router.patch(
    "/sessions/{session_id}",
    response_model=ChatSessionResponse,
    summary="Update chat session metadata",
)
def update_session(
    session_id: int,
    update_data: ChatSessionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = chat_service.update_session(db, session_id, current_user, update_data)
    return ChatSessionResponse.from_orm(session)


@router.delete(
    "/sessions/{session_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete chat session",
)
def delete_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    chat_service.delete_session(db, session_id, current_user)


@router.post(
    "/message",
    response_model=ChatResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Send message to AI assistant",
)
async def send_message(
    message_data: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    response = await chat_service.send_message(db, current_user, message_data)
    return response


@router.get(
    "/sessions/{session_id}/messages",
    response_model=List[MessageResponse],
    summary="Get all messages in a session",
)
def get_session_messages(
    session_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    messages = chat_service.get_session_messages(
        db, session_id, current_user, skip, limit
    )
    return [MessageResponse.from_orm(m) for m in messages]

