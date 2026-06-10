"""
Database Models
SQLAlchemy ORM models for all MindSpark tables.
"""

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey,
    Enum as SQLEnum,
    Boolean,
    Float,
    JSON,
    Index,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector
import enum

from app.db.base import Base
from app.core.config import settings


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class UserRole(str, enum.Enum):
    STUDENT = "student"
    ADMIN = "admin"


class MessageRole(str, enum.Enum):
    USER = "user"
    ASSISTANT = "assistant"
    TOOL = "tool"


class Subject(str, enum.Enum):
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


class DocumentStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    READY = "ready"
    FAILED = "failed"


class FlashcardState(str, enum.Enum):
    """FSRS learning state"""
    NEW = "new"
    LEARNING = "learning"
    REVIEW = "review"
    RELEARNING = "relearning"


class QuizStatus(str, enum.Enum):
    DRAFT = "draft"
    READY = "ready"
    ARCHIVED = "archived"


class QuestionType(str, enum.Enum):
    MCQ = "mcq"               # single correct choice
    SHORT = "short"            # short answer, exact-match-ish
    OPEN = "open"              # open-ended, LLM-graded


# ---------------------------------------------------------------------------
# Users / chat (existing)
# ---------------------------------------------------------------------------

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255))
    role = Column(SQLEnum(UserRole), default=UserRole.STUDENT, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True))

    sessions = relationship("ChatSession", back_populates="user", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")
    flashcards = relationship("Flashcard", back_populates="user", cascade="all, delete-orphan")
    quizzes = relationship("Quiz", back_populates="user", cascade="all, delete-orphan")


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), default="New Study Session")
    subject = Column(SQLEnum(Subject), default=Subject.OTHER)

    is_active = Column(Boolean, default=True, nullable=False)
    message_count = Column(Integer, default=0, nullable=False)

    # Optional: a session can be "grounded" on a single document for RAG
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="SET NULL"), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="sessions")
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")
    document = relationship("Document", foreign_keys=[document_id])


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(SQLEnum(MessageRole), nullable=False)
    content = Column(Text, nullable=False)

    tokens_used = Column(Integer)
    model_used = Column(String(50))
    response_time = Column(Integer)

    # Tool/RAG provenance — arrays of dicts as JSON
    # citations: [{document_id, chunk_id, score, snippet}]
    # tool_calls: [{name, arguments, result, duration_ms}]
    citations = Column(JSON)
    tool_calls = Column(JSON)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)

    session = relationship("ChatSession", back_populates="messages")


# ---------------------------------------------------------------------------
# Documents + RAG
# ---------------------------------------------------------------------------

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    title = Column(String(255), nullable=False)
    filename = Column(String(255), nullable=False)
    mime_type = Column(String(100))
    subject = Column(SQLEnum(Subject), default=Subject.OTHER)

    status = Column(SQLEnum(DocumentStatus), default=DocumentStatus.PENDING, nullable=False)
    error = Column(Text)

    char_count = Column(Integer, default=0)
    chunk_count = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="documents")
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    chunk_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    token_count = Column(Integer, default=0)
    page = Column(Integer)  # for PDFs: the source page (1-indexed)

    # pgvector column — dimension matches embedding model
    embedding = Column(Vector(settings.EMBEDDING_DIMENSIONS))

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    document = relationship("Document", back_populates="chunks")

    __table_args__ = (
        Index("ix_document_chunks_doc_idx", "document_id", "chunk_index"),
    )


# ---------------------------------------------------------------------------
# Flashcards (FSRS)
# ---------------------------------------------------------------------------

class Flashcard(Base):
    """
    A single flashcard owned by a user. State follows the FSRS scheduler:
    difficulty (D), stability (S), and state/due drive the review queue.
    """
    __tablename__ = "flashcards"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Optional provenance
    session_id = Column(Integer, ForeignKey("chat_sessions.id", ondelete="SET NULL"), nullable=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="SET NULL"), nullable=True, index=True)
    subject = Column(SQLEnum(Subject), default=Subject.OTHER, index=True)

    front = Column(Text, nullable=False)
    back = Column(Text, nullable=False)
    topic = Column(String(200))  # optional sub-topic tag

    # FSRS state
    state = Column(SQLEnum(FlashcardState), default=FlashcardState.NEW, nullable=False, index=True)
    difficulty = Column(Float, default=0.0, nullable=False)   # D, 1..10
    stability = Column(Float, default=0.0, nullable=False)    # S, days
    reps = Column(Integer, default=0, nullable=False)         # total reviews
    lapses = Column(Integer, default=0, nullable=False)       # times forgotten

    last_review_at = Column(DateTime(timezone=True))
    due_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), index=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="flashcards")
    reviews = relationship("FlashcardReview", back_populates="flashcard", cascade="all, delete-orphan")


class FlashcardReview(Base):
    """Log of every review for analysis and retention curves."""
    __tablename__ = "flashcard_reviews"

    id = Column(Integer, primary_key=True, index=True)
    flashcard_id = Column(Integer, ForeignKey("flashcards.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    rating = Column(Integer, nullable=False)  # 1=again, 2=hard, 3=good, 4=easy
    elapsed_days = Column(Float, default=0.0)
    scheduled_days = Column(Float, default=0.0)
    state_before = Column(SQLEnum(FlashcardState))
    state_after = Column(SQLEnum(FlashcardState))
    stability_after = Column(Float)
    difficulty_after = Column(Float)

    reviewed_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)

    flashcard = relationship("Flashcard", back_populates="reviews")


# ---------------------------------------------------------------------------
# Quizzes
# ---------------------------------------------------------------------------

class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    title = Column(String(255), nullable=False)
    subject = Column(SQLEnum(Subject), default=Subject.OTHER, index=True)
    status = Column(SQLEnum(QuizStatus), default=QuizStatus.DRAFT, nullable=False)

    source_session_id = Column(Integer, ForeignKey("chat_sessions.id", ondelete="SET NULL"), nullable=True)
    source_document_id = Column(Integer, ForeignKey("documents.id", ondelete="SET NULL"), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="quizzes")
    questions = relationship(
        "QuizQuestion",
        back_populates="quiz",
        cascade="all, delete-orphan",
        order_by="QuizQuestion.order_index",
    )
    attempts = relationship("QuizAttempt", back_populates="quiz", cascade="all, delete-orphan")


class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False, index=True)

    order_index = Column(Integer, nullable=False, default=0)
    type = Column(SQLEnum(QuestionType), nullable=False)
    prompt = Column(Text, nullable=False)

    # For MCQ: ["option A", "option B", ...]
    choices = Column(JSON)
    # For MCQ: index into choices
    correct_choice = Column(Integer)
    # For SHORT/OPEN: reference answer
    reference_answer = Column(Text)
    # For OPEN: grading rubric (3-5 criteria, array of strings)
    rubric = Column(JSON)

    explanation = Column(Text)
    topic = Column(String(200))

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    quiz = relationship("Quiz", back_populates="questions")


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    score = Column(Float, default=0.0, nullable=False)          # 0..1
    total_points = Column(Float, default=0.0, nullable=False)
    earned_points = Column(Float, default=0.0, nullable=False)

    # answers: [{question_id, answer, correct: bool|null, score: 0..1, feedback}]
    answers = Column(JSON)

    started_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    completed_at = Column(DateTime(timezone=True))

    quiz = relationship("Quiz", back_populates="attempts")
