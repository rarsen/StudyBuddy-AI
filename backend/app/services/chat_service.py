from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.db.models import ChatSession, ChatMessage, MessageRole, User, Subject
from app.schemas.chat import (
    ChatSessionCreate,
    ChatSessionUpdate,
    MessageCreate,
    ChatResponse
)
from app.services.ai_service import ai_service


class ChatService:
    
    @staticmethod
    def create_session(
        db: Session,
        user: User,
        session_data: ChatSessionCreate
    ) -> ChatSession:
        session = ChatSession(
            user_id=user.id,
            title=session_data.title,
            subject=session_data.subject,
            is_active=True,
            message_count=0
        )
        
        db.add(session)
        db.commit()
        db.refresh(session)
        return session
    
    @staticmethod
    def get_user_sessions(
        db: Session,
        user: User,
        skip: int = 0,
        limit: int = 100,
        active_only: bool = False
    ) -> List[ChatSession]:
        query = db.query(ChatSession).filter(ChatSession.user_id == user.id)
        
        if active_only:
            query = query.filter(ChatSession.is_active == True)
        
        sessions = query.order_by(ChatSession.updated_at.desc()).offset(skip).limit(limit).all()
        
        return sessions
    
    @staticmethod
    def get_session(
        db: Session,
        session_id: int,
        user: User
    ) -> ChatSession:
        session = db.query(ChatSession).filter(
            ChatSession.id == session_id,
            ChatSession.user_id == user.id
        ).first()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat session not found"
            )
        
        return session
    
    @staticmethod
    def update_session(
        db: Session,
        session_id: int,
        user: User,
        update_data: ChatSessionUpdate
    ) -> ChatSession:
        session = ChatService.get_session(db, session_id, user)
        
        update_dict = update_data.dict(exclude_unset=True)
        for field, value in update_dict.items():
            setattr(session, field, value)
        
        db.commit()
        db.refresh(session)
        return session
    
    @staticmethod
    def delete_session(
        db: Session,
        session_id: int,
        user: User
    ):
        session = ChatService.get_session(db, session_id, user)
        
        session.is_active = False
        db.commit()
    
    @staticmethod
    async def send_message(
        db: Session,
        user: User,
        message_data: MessageCreate
    ) -> ChatResponse:
        if message_data.session_id:
            session = ChatService.get_session(db, message_data.session_id, user)
        else:
            session_create = ChatSessionCreate(
                title="New Study Session",
                subject=message_data.subject or Subject.OTHER
            )
            session = ChatService.create_session(db, user, session_create)
        
        user_message = ChatMessage(
            session_id=session.id,
            role=MessageRole.USER,
            content=message_data.content
        )
        db.add(user_message)
        db.flush()
        
        previous_messages = db.query(ChatMessage).filter(
            ChatMessage.session_id == session.id
        ).order_by(ChatMessage.created_at.desc()).limit(10).all()
        
        conversation_history = []
        for msg in reversed(previous_messages):
            conversation_history.append({
                "role": msg.role.value,
                "content": msg.content
            })
        
        try:
            ai_response = await ai_service.generate_response(
                user_message=message_data.content,
                conversation_history=conversation_history,
                subject=session.subject.value if session.subject else None
            )
        except Exception:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate AI response. Please try again."
            )
        
        assistant_message = ChatMessage(
            session_id=session.id,
            role=MessageRole.ASSISTANT,
            content=ai_response["content"],
            tokens_used=ai_response["tokens_used"],
            model_used=ai_response["model_used"],
            response_time=ai_response["response_time"]
        )
        db.add(assistant_message)
        
        session.message_count += 2
        
        if session.message_count == 2 and session.title == "New Study Session":
            try:
                new_title = await ai_service.generate_session_title(message_data.content)
                session.title = new_title
            except Exception:
                pass
        
        db.commit()
        db.refresh(user_message)
        db.refresh(assistant_message)
        from app.schemas.chat import MessageResponse
        return ChatResponse(
            session_id=session.id,
            user_message=MessageResponse.from_orm(user_message),
            assistant_message=MessageResponse.from_orm(assistant_message)
        )
    
    @staticmethod
    def get_session_messages(
        db: Session,
        session_id: int,
        user: User,
        skip: int = 0,
        limit: int = 100
    ) -> List[ChatMessage]:
        session = ChatService.get_session(db, session_id, user)
        
        messages = db.query(ChatMessage).filter(
            ChatMessage.session_id == session_id
        ).order_by(ChatMessage.created_at.asc()).offset(skip).limit(limit).all()
        
        return messages


# Create service instance
chat_service = ChatService()

