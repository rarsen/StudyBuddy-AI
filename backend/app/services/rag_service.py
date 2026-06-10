"""
RAG service: document ingestion, chunking, embedding, and retrieval.

Pipeline:
    upload --> extract text --> chunk (token-based, overlapping)
           --> embed (batched) --> store in pgvector
    query  --> embed --> cosine similarity search (pgvector <=> operator)

The service is deliberately synchronous and small; it runs inside the
request-handler thread for simplicity. For production scale it should be
moved to a background worker (Celery / RQ / Arq).
"""

from __future__ import annotations

import io
import logging
from dataclasses import dataclass
from typing import List, Optional, Tuple

import tiktoken
from fastapi import HTTPException, UploadFile, status
from pypdf import PdfReader
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.models import Document, DocumentChunk, DocumentStatus, Subject, User
from app.services.embedding_service import embedding_service

logger = logging.getLogger(__name__)


try:
    _ENCODER = tiktoken.get_encoding("cl100k_base")
except Exception:  # pragma: no cover
    _ENCODER = None


def _tok_len(text: str) -> int:
    if _ENCODER is None:
        return max(1, len(text) // 4)
    return len(_ENCODER.encode(text))


def _tok_slice(text: str, start: int, end: int) -> str:
    if _ENCODER is None:
        return text[start * 4 : end * 4]
    ids = _ENCODER.encode(text)
    return _ENCODER.decode(ids[start:end])


# ---------------------------------------------------------------------------
# Text extraction
# ---------------------------------------------------------------------------

@dataclass
class PageText:
    page: Optional[int]
    text: str


def _extract_pdf(data: bytes) -> List[PageText]:
    reader = PdfReader(io.BytesIO(data))
    pages: List[PageText] = []
    for i, page in enumerate(reader.pages, start=1):
        try:
            txt = page.extract_text() or ""
        except Exception as e:
            logger.warning(f"PDF page {i} extraction failed: {e}")
            txt = ""
        if txt.strip():
            pages.append(PageText(page=i, text=txt))
    return pages


def _extract_text(data: bytes) -> List[PageText]:
    try:
        return [PageText(page=None, text=data.decode("utf-8"))]
    except UnicodeDecodeError:
        return [PageText(page=None, text=data.decode("latin-1", errors="ignore"))]


def _dispatch_extract(filename: str, content_type: Optional[str], data: bytes) -> List[PageText]:
    name = (filename or "").lower()
    ct = (content_type or "").lower()
    if name.endswith(".pdf") or "pdf" in ct:
        return _extract_pdf(data)
    if name.endswith((".txt", ".md", ".markdown")) or ct.startswith("text/"):
        return _extract_text(data)
    # fall back: try text decode
    return _extract_text(data)


# ---------------------------------------------------------------------------
# Chunking
# ---------------------------------------------------------------------------

def _chunk_page(
    text: str,
    chunk_size: int,
    overlap: int,
) -> List[Tuple[str, int]]:
    """
    Token-based sliding window chunker. Returns list of (chunk_text, token_count).
    """
    if not text.strip():
        return []
    if _ENCODER is None:
        # Naive char-based fallback
        step = max(1, (chunk_size - overlap) * 4)
        size = chunk_size * 4
        chunks: List[Tuple[str, int]] = []
        for i in range(0, len(text), step):
            piece = text[i : i + size]
            if piece.strip():
                chunks.append((piece, max(1, len(piece) // 4)))
        return chunks

    ids = _ENCODER.encode(text)
    n = len(ids)
    if n == 0:
        return []
    step = max(1, chunk_size - overlap)
    chunks: List[Tuple[str, int]] = []
    for start in range(0, n, step):
        end = min(n, start + chunk_size)
        piece = _ENCODER.decode(ids[start:end])
        if piece.strip():
            chunks.append((piece, end - start))
        if end == n:
            break
    return chunks


# ---------------------------------------------------------------------------
# Service
# ---------------------------------------------------------------------------

MAX_UPLOAD_BYTES = 15 * 1024 * 1024  # 15 MB
SUPPORTED_EXTS = (".pdf", ".txt", ".md", ".markdown")


class RagService:
    @staticmethod
    async def upload_document(
        db: Session,
        user: User,
        file: UploadFile,
        title: Optional[str],
        subject: Optional[Subject],
    ) -> Document:
        filename = file.filename or "document"
        if not filename.lower().endswith(SUPPORTED_EXTS):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file type. Supported: {', '.join(SUPPORTED_EXTS)}",
            )

        data = await file.read()
        if not data:
            raise HTTPException(status_code=400, detail="Uploaded file is empty")
        if len(data) > MAX_UPLOAD_BYTES:
            raise HTTPException(status_code=413, detail="File too large (max 15 MB)")

        document = Document(
            user_id=user.id,
            title=(title or filename).strip()[:255],
            filename=filename,
            mime_type=file.content_type or "",
            subject=subject or Subject.OTHER,
            status=DocumentStatus.PROCESSING,
            char_count=0,
            chunk_count=0,
        )
        db.add(document)
        db.commit()
        db.refresh(document)

        try:
            RagService._ingest(db, document, data)
            document.status = DocumentStatus.READY
            document.error = None
        except Exception as e:
            logger.exception("Ingestion failed for document %s", document.id)
            document.status = DocumentStatus.FAILED
            document.error = str(e)[:500]
        db.commit()
        db.refresh(document)
        return document

    @staticmethod
    def _ingest(db: Session, document: Document, data: bytes) -> None:
        pages = _dispatch_extract(document.filename, document.mime_type, data)
        if not pages:
            raise ValueError("Could not extract any text from document")

        total_chars = sum(len(p.text) for p in pages)
        document.char_count = total_chars

        # Build all chunks first so we can batch embed
        all_chunks: List[Tuple[Optional[int], str, int]] = []  # (page, text, token_count)
        for p in pages:
            for piece, toks in _chunk_page(
                p.text,
                chunk_size=settings.RAG_CHUNK_SIZE_TOKENS,
                overlap=settings.RAG_CHUNK_OVERLAP_TOKENS,
            ):
                all_chunks.append((p.page, piece, toks))

        if not all_chunks:
            raise ValueError("Document produced no chunks after splitting")

        # Embed in batches (the OpenAI API accepts up to ~2048 inputs per call,
        # but we keep batches small for memory friendliness).
        BATCH = 64
        embeddings: List[List[float]] = []
        for i in range(0, len(all_chunks), BATCH):
            batch = [c[1] for c in all_chunks[i : i + BATCH]]
            embeddings.extend(embedding_service.embed_many(batch))

        for idx, ((page, piece, toks), emb) in enumerate(zip(all_chunks, embeddings)):
            db.add(
                DocumentChunk(
                    document_id=document.id,
                    user_id=document.user_id,
                    chunk_index=idx,
                    content=piece,
                    token_count=toks,
                    page=page,
                    embedding=emb,
                )
            )
        document.chunk_count = len(all_chunks)
        db.flush()

    @staticmethod
    def list_documents(db: Session, user: User) -> List[Document]:
        return (
            db.query(Document)
            .filter(Document.user_id == user.id)
            .order_by(Document.created_at.desc())
            .all()
        )

    @staticmethod
    def get_document(db: Session, user: User, document_id: int) -> Document:
        doc = (
            db.query(Document)
            .filter(Document.id == document_id, Document.user_id == user.id)
            .first()
        )
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")
        return doc

    @staticmethod
    def delete_document(db: Session, user: User, document_id: int) -> None:
        doc = RagService.get_document(db, user, document_id)
        db.delete(doc)
        db.commit()

    @staticmethod
    def list_chunks(
        db: Session,
        user: User,
        document_id: int,
        limit: int = 20,
    ) -> List[DocumentChunk]:
        """Preview chunks for the Documents UI."""
        RagService.get_document(db, user, document_id)  # perms check
        return (
            db.query(DocumentChunk)
            .filter(DocumentChunk.document_id == document_id)
            .order_by(DocumentChunk.chunk_index.asc())
            .limit(limit)
            .all()
        )

    @staticmethod
    def retrieve(
        db: Session,
        user: User,
        query: str,
        top_k: Optional[int] = None,
        document_ids: Optional[List[int]] = None,
        min_score: Optional[float] = None,
    ) -> List[dict]:
        """
        Retrieve top-k relevant chunks for a query using cosine distance.

        Low-similarity hits are filtered out so we never ground the LLM on
        unrelated snippets — RAG quality depends on refusing to retrieve when
        nothing useful is in the index.

        Returns: list of {chunk_id, document_id, document_title, page, score, snippet}
        sorted by similarity (highest first).
        """
        if not query or not query.strip():
            return []

        k = top_k or settings.RAG_TOP_K
        q_emb = embedding_service.embed_one(query)

        # pgvector: <=> is cosine distance (0 = identical, 2 = opposite)
        stmt = (
            select(
                DocumentChunk,
                DocumentChunk.embedding.cosine_distance(q_emb).label("distance"),
            )
            .join(Document, Document.id == DocumentChunk.document_id)
            .where(DocumentChunk.user_id == user.id)
            .where(Document.status == DocumentStatus.READY)
            .order_by("distance")
            .limit(k)
        )
        if document_ids:
            stmt = stmt.where(DocumentChunk.document_id.in_(document_ids))

        floor = min_score
        if floor is None:
            floor = (
                settings.RAG_MIN_SCORE_MOCK
                if embedding_service.use_mock
                else settings.RAG_MIN_SCORE
            )

        rows = db.execute(stmt).all()
        hits: List[dict] = []
        for chunk, distance in rows:
            similarity = 1.0 - float(distance)
            if similarity < floor:
                continue
            hits.append(
                {
                    "chunk_id": chunk.id,
                    "document_id": chunk.document_id,
                    "document_title": chunk.document.title if chunk.document else None,
                    "page": chunk.page,
                    "score": round(similarity, 4),
                    "snippet": chunk.content,
                }
            )
        return hits


rag_service = RagService()
