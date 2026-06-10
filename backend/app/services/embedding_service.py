"""
Embedding service — wraps OpenAI embeddings + a deterministic mock fallback.

The mock embedder is a stable, non-cryptographic hash-to-vector mapping so
that retrieval still works (roughly) without an API key. It is NOT production
quality, but it lets the RAG pipeline be demoed offline and keeps tests
deterministic.
"""

from __future__ import annotations

import hashlib
import logging
import math
import re
from typing import Iterable, List

from app.core.config import settings

logger = logging.getLogger(__name__)


def _is_mock() -> bool:
    k = (settings.OPENAI_API_KEY or "").lower()
    return (
        not k
        or k.endswith("here")
        or k == "your-api-key"
        or k.startswith("mock-")
        or "mock" in k
    )


_WORD_RE = re.compile(r"[\w']+", re.UNICODE)


def _mock_embed(text: str, dim: int) -> List[float]:
    """Hashing-based bag-of-words embedding, L2-normalized."""
    vec = [0.0] * dim
    for word in _WORD_RE.findall(text.lower()):
        h = hashlib.md5(word.encode("utf-8")).digest()
        # Use two bytes to derive bucket + sign
        bucket = int.from_bytes(h[:4], "big") % dim
        sign = 1 if h[4] & 1 else -1
        vec[bucket] += sign
    norm = math.sqrt(sum(x * x for x in vec))
    if norm == 0:
        vec[0] = 1.0
        return vec
    return [x / norm for x in vec]


class EmbeddingService:
    def __init__(self) -> None:
        self.model = settings.EMBEDDING_MODEL
        self.dim = settings.EMBEDDING_DIMENSIONS
        self.use_mock = _is_mock()
        self._client = None
        if not self.use_mock:
            from openai import OpenAI

            self._client = OpenAI(api_key=settings.OPENAI_API_KEY)
        else:
            logger.warning("EmbeddingService using deterministic MOCK embeddings")

    def embed_one(self, text: str) -> List[float]:
        return self.embed_many([text])[0]

    def embed_many(self, texts: Iterable[str]) -> List[List[float]]:
        items = [t if t else " " for t in texts]
        if not items:
            return []

        if self.use_mock:
            return [_mock_embed(t, self.dim) for t in items]

        # OpenAI embeddings — batched
        try:
            resp = self._client.embeddings.create(
                model=self.model,
                input=items,
                dimensions=self.dim if self.model.startswith("text-embedding-3") else None,
            )
            return [d.embedding for d in resp.data]
        except TypeError:
            # older SDK without `dimensions` kw
            resp = self._client.embeddings.create(model=self.model, input=items)
            return [d.embedding for d in resp.data]


embedding_service = EmbeddingService()
