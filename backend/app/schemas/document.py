"""Pydantic schemas for documents and retrieval."""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field

from app.db.models import DocumentStatus, Subject


class DocumentResponse(BaseModel):
    id: int
    title: str
    filename: str
    mime_type: Optional[str] = None
    subject: Subject
    status: DocumentStatus
    error: Optional[str] = None
    char_count: int
    chunk_count: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class RetrievalHit(BaseModel):
    chunk_id: int
    document_id: int
    document_title: Optional[str] = None
    page: Optional[int] = None
    score: float
    snippet: str


class RetrievalRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=2000)
    top_k: Optional[int] = Field(None, ge=1, le=20)
    document_ids: Optional[List[int]] = None


class RetrievalResponse(BaseModel):
    query: str
    hits: List[RetrievalHit]


class ChunkPreview(BaseModel):
    id: int
    chunk_index: int
    page: Optional[int] = None
    token_count: int
    content: str

    model_config = ConfigDict(from_attributes=True)
