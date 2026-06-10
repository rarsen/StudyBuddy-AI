"""
Chat service — orchestrates the user → RAG → LLM → persist pipeline.

Key design choices:
- Retrieval runs BEFORE generation so citation numbers match what the UI renders.
- Only sources that end up visible ([n] markers) are persisted. The full hit
  list is kept in ChatMessage.citations so the UI can render them with
  document title + page.
- If the session is grounded on a specific document (ChatSession.document_id),
  retrieval is scoped to that document only.
"""

from typing import Any, Dict, List, Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.db.models import (
    ChatMessage,
    ChatSession,
    Document,
    DocumentStatus,
    MessageRole,
    Subject,
    User,
)
from app.schemas.chat import (
    ChatResponse,
    ChatSessionCreate,
    ChatSessionUpdate,
    MessageCreate,
    MessageResponse,
)
from app.services.ai_service import ai_service, sanitize_citations
from app.services.rag_service import rag_service


class ChatService:
    # ----- Sessions -----------------------------------------------------

    @staticmethod
    def create_session(
        db: Session, user: User, session_data: ChatSessionCreate
    ) -> ChatSession:
        # If a grounding document was requested, confirm it belongs to the user.
        document_id = session_data.document_id
        if document_id is not None:
            doc = (
                db.query(Document)
                .filter(Document.id == document_id, Document.user_id == user.id)
                .first()
            )
            if not doc:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Grounding document not found",
                )

        session = ChatSession(
            user_id=user.id,
            title=session_data.title,
            subject=session_data.subject,
            is_active=True,
            message_count=0,
            document_id=document_id,
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
        active_only: bool = False,
    ) -> List[ChatSession]:
        q = db.query(ChatSession).filter(ChatSession.user_id == user.id)
        if active_only:
            q = q.filter(ChatSession.is_active == True)  # noqa: E712
        return (
            q.order_by(ChatSession.updated_at.desc().nullslast(), ChatSession.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    @staticmethod
    def get_session(db: Session, session_id: int, user: User) -> ChatSession:
        session = (
            db.query(ChatSession)
            .filter(ChatSession.id == session_id, ChatSession.user_id == user.id)
            .first()
        )
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat session not found",
            )
        return session

    @staticmethod
    def update_session(
        db: Session,
        session_id: int,
        user: User,
        update_data: ChatSessionUpdate,
    ) -> ChatSession:
        session = ChatService.get_session(db, session_id, user)
        for field, value in update_data.model_dump(exclude_unset=True).items():
            setattr(session, field, value)
        db.commit()
        db.refresh(session)
        return session

    @staticmethod
    def delete_session(db: Session, session_id: int, user: User) -> None:
        session = ChatService.get_session(db, session_id, user)
        session.is_active = False
        db.commit()

    # ----- Messaging ----------------------------------------------------

    @staticmethod
    def _resolve_document_scope(
        db: Session, user: User, session: ChatSession
    ) -> Optional[List[int]]:
        """If the session is grounded on a specific document, return [id]; else None."""
        if not session.document_id:
            return None
        doc = (
            db.query(Document)
            .filter(
                Document.id == session.document_id,
                Document.user_id == user.id,
                Document.status == DocumentStatus.READY,
            )
            .first()
        )
        return [doc.id] if doc else None

    @staticmethod
    def _retrieve_for_message(
        db: Session, user: User, session: ChatSession, query: str
    ) -> List[Dict[str, Any]]:
        """Run RAG retrieval, scoped to the session's grounding document if set."""
        doc_scope = ChatService._resolve_document_scope(db, user, session)
        try:
            hits = rag_service.retrieve(
                db, user, query=query, document_ids=doc_scope
            )
        except Exception:
            # Retrieval must never block chat — degrade to no-RAG.
            hits = []
        return hits

    @staticmethod
    async def send_message(
        db: Session, user: User, message_data: MessageCreate
    ) -> ChatResponse:
        if message_data.session_id:
            session = ChatService.get_session(db, message_data.session_id, user)
        else:
            session = ChatService.create_session(
                db,
                user,
                ChatSessionCreate(
                    title="New Study Session",
                    subject=message_data.subject or Subject.OTHER,
                ),
            )

        # Persist the user message first so retrieval has stable IDs if it fails.
        user_message = ChatMessage(
            session_id=session.id,
            role=MessageRole.USER,
            content=message_data.content,
        )
        db.add(user_message)
        db.flush()

        # Build short conversation history
        recent = (
            db.query(ChatMessage)
            .filter(ChatMessage.session_id == session.id)
            .order_by(ChatMessage.created_at.desc())
            .limit(10)
            .all()
        )
        conversation_history = [
            {"role": m.role.value, "content": m.content} for m in reversed(recent)
        ]

        # --- RAG retrieval --------------------------------------------
        hits = ChatService._retrieve_for_message(db, user, session, message_data.content)

        # --- LLM generation -------------------------------------------
        try:
            ai_response = await ai_service.generate_response(
                user_message=message_data.content,
                conversation_history=conversation_history,
                subject=session.subject.value if session.subject else None,
                rag_hits=hits,
            )
        except Exception:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate AI response. Please try again.",
            )

        # Strip any hallucinated citation markers out of the assistant output.
        content = sanitize_citations(ai_response["content"], max_n=len(hits))

        assistant_message = ChatMessage(
            session_id=session.id,
            role=MessageRole.ASSISTANT,
            content=content,
            tokens_used=ai_response["tokens_used"],
            model_used=ai_response["model_used"],
            response_time=ai_response["response_time"],
            citations=hits if hits else None,
        )
        db.add(assistant_message)

        session.message_count += 2

        if session.message_count == 2 and session.title == "New Study Session":
            try:
                session.title = await ai_service.generate_session_title(
                    message_data.content
                )
            except Exception:
                pass

        db.commit()
        db.refresh(user_message)
        db.refresh(assistant_message)

        return ChatResponse(
            session_id=session.id,
            user_message=MessageResponse.model_validate(user_message),
            assistant_message=MessageResponse.model_validate(assistant_message),
        )

    @staticmethod
    def get_session_messages(
        db: Session,
        session_id: int,
        user: User,
        skip: int = 0,
        limit: int = 100,
    ) -> List[ChatMessage]:
        ChatService.get_session(db, session_id, user)
        return (
            db.query(ChatMessage)
            .filter(ChatMessage.session_id == session_id)
            .order_by(ChatMessage.created_at.asc())
            .offset(skip)
            .limit(limit)
            .all()
        )


chat_service = ChatService()
