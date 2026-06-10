"""Document upload + retrieval endpoints."""

import logging
from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.models import Subject, User
from app.db.session import get_db
from app.schemas.document import (
    ChunkPreview,
    DocumentResponse,
    RetrievalRequest,
    RetrievalResponse,
)
from app.services.rag_service import rag_service

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post(
    "/upload",
    response_model=DocumentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload a study document (PDF / TXT / MD)",
)
async def upload_document(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    subject: Optional[Subject] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc = await rag_service.upload_document(db, current_user, file, title, subject)
    return DocumentResponse.model_validate(doc)


@router.get(
    "",
    response_model=List[DocumentResponse],
    summary="List the current user's documents",
)
def list_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    docs = rag_service.list_documents(db, current_user)
    return [DocumentResponse.model_validate(d) for d in docs]


@router.get(
    "/{document_id}",
    response_model=DocumentResponse,
    summary="Get a single document's metadata",
)
def get_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc = rag_service.get_document(db, current_user, document_id)
    return DocumentResponse.model_validate(doc)


@router.delete(
    "/{document_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a document and its chunks/embeddings",
)
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rag_service.delete_document(db, current_user, document_id)


@router.get(
    "/{document_id}/chunks",
    response_model=List[ChunkPreview],
    summary="Preview a document's chunks (for the Documents UI)",
)
def preview_chunks(
    document_id: int,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    chunks = rag_service.list_chunks(db, current_user, document_id, limit=min(limit, 100))
    return [ChunkPreview.model_validate(c) for c in chunks]


@router.post(
    "/search",
    response_model=RetrievalResponse,
    summary="Semantic search over the user's documents",
)
def search(
    payload: RetrievalRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    hits = rag_service.retrieve(
        db,
        current_user,
        query=payload.query,
        top_k=payload.top_k,
        document_ids=payload.document_ids,
    )
    return RetrievalResponse(query=payload.query, hits=hits)
