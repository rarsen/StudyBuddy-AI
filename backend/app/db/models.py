"""
Database Models
SQLAlchemy ORM models for all database tables
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum as SQLEnum, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.db.base import Base


class UserRole(str, enum.Enum):
    """User role enumeration"""
    STUDENT = "student"
    ADMIN = "admin"


class MessageRole(str, enum.Enum):
    """Chat message role enumeration"""
    USER = "user"
    ASSISTANT = "assistant"


class Subject(str, enum.Enum):
    """Academic subject categories"""
    MATHEMATICS = "mathematics"
    PHYSICS = "physics"
    CHEMISTRY = "chemistry"
    BIOLOGY = "biology"
    COMPUTER_SCIENCE = "computer_science"
    HISTORY = "history"
    LITERATURE = "literature"
    LANGUAGE = "language"
    ECONOMICS = "economics"
    OTHER = "other"


class User(Base):
    """
    User model representing registered students and admins
    Stores authentication credentials and profile information
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255))
    role = Column(SQLEnum(UserRole), default=UserRole.STUDENT, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True))
    
    # Relationships
    sessions = relationship("ChatSession", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', email='{self.email}')>"


class ChatSession(Base):
    """
    Chat session model representing a conversation between user and AI
    Groups related messages together in a single study session
    """
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), default="New Study Session")
    subject = Column(SQLEnum(Subject), default=Subject.OTHER)
    
    # Session metadata
    is_active = Column(Boolean, default=True, nullable=False)
    message_count = Column(Integer, default=0, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="sessions")
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<ChatSession(id={self.id}, user_id={self.user_id}, title='{self.title}')>"


class ChatMessage(Base):
    """
    Chat message model representing individual messages in a conversation
    Stores both user questions and AI responses
    """
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(SQLEnum(MessageRole), nullable=False)
    content = Column(Text, nullable=False)
    
    # AI Response metadata (only for assistant messages)
    tokens_used = Column(Integer)
    model_used = Column(String(50))
    response_time = Column(Integer)  # milliseconds
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    
    # Relationships
    session = relationship("ChatSession", back_populates="messages")

    def __repr__(self):
        return f"<ChatMessage(id={self.id}, role='{self.role}', session_id={self.session_id})>"

