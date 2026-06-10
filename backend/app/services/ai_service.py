"""
AI service — the model-facing layer.

Responsibilities:
    - Wrap OpenAI chat completion (or a deterministic mock fallback).
    - Render retrieved RAG chunks as a numbered Source block the model can cite.
    - Enforce a studying-focused system prompt with explicit citation rules.

The mock path exists so the whole app is runnable offline — important for
grading, defense demos, and CI. Mock responses are intentionally simple; when
RAG context is supplied they splice in a visible [1] citation so the end-to-end
citation pipeline can be demoed without an API key.
"""

from __future__ import annotations

import logging
import random
import re
import time
from typing import Any, Dict, List, Optional

from app.core.config import settings

logger = logging.getLogger(__name__)


def _is_mock_key() -> bool:
    k = (settings.OPENAI_API_KEY or "").lower()
    return (
        not k
        or k.endswith("here")
        or k == "your-api-key"
        or k.startswith("mock-")
        or "mock" in k
    )


USE_MOCK_AI = _is_mock_key()


BASE_SYSTEM_PROMPT = """You are MindSpark, an advanced educational companion specialized in exam preparation and deep conceptual learning.

CORE MISSION
Help students not just memorize, but truly understand material in a way that builds lasting knowledge and exam confidence.

TEACHING APPROACH
1. Diagnostic understanding — assess the student's level and knowledge gaps before explaining.
2. Explanation framework — start with the big picture, then zoom in. Use analogies, step-by-step breakdowns, and real-world applications.
3. Active learning — ask the student to restate ideas in their own words, pose practice questions mirroring exam formats, and surface common misconceptions.
4. Exam-specific strategies — identify high-yield topics, teach question interpretation and answer structure, and share time-management tips.
5. Metacognitive development — teach students *how* to study, not just *what* to study.

RESPONSE STRUCTURE
- For concepts: simple definition, detailed explanation, example or analogy, common pitfalls, quick self-check question.
- For problems: reframe what is actually being asked, outline the approach, work step-by-step, verify the answer, give a similar practice problem.

STYLE
- Encouraging, patient, never condescending. Celebrate progress, normalize struggle.
- Use bold for key terms, bullets for lists, numbering for sequences.
- If uncertain, say so clearly instead of guessing.
- Never do a student's take-home exam for them — coach them through it.
"""


CITATION_RULES = """SOURCE-GROUNDED ANSWERING
You have been given excerpts from the student's own study materials in a "Sources" block below. The rules are strict:

1. Prefer the sources. When the answer is present in the sources, use them — do not contradict them.
2. Cite inline. After any claim drawn from a source, place a citation marker in square brackets, e.g. [1] or [2][3]. The number matches the source list. Place the marker at the end of the sentence or phrase.
3. Do not invent sources. Only use the numbers present in the Sources block. Never write [4] if there is no source 4.
4. Admit gaps. If the sources do not cover the question, say so explicitly (e.g. "Your notes don't cover this directly, but …") and then answer from general knowledge without citation markers.
5. Quote sparingly. Paraphrase in your own voice; short direct quotes are fine when precision matters.
6. Never dump the sources verbatim. Teach — cite.
"""


def _render_sources_block(hits: List[Dict[str, Any]]) -> str:
    """
    Render retrieved chunks as a numbered block the model can cite as [n].

    The numbering here is the numbering the student will see in the UI, so it
    must match exactly what chat_service persists on the assistant message.
    """
    lines = ["### Sources (use [n] to cite)"]
    for i, h in enumerate(hits, start=1):
        title = h.get("document_title") or f"Document #{h.get('document_id')}"
        page = h.get("page")
        loc = f", p. {page}" if page else ""
        score = h.get("score")
        # Snippet is truncated; the UI shows the full text on click.
        snippet = (h.get("snippet") or "").strip().replace("\n", " ")
        if len(snippet) > 900:
            snippet = snippet[:900] + "…"
        lines.append(f"[{i}] {title}{loc} (score {score})\n{snippet}")
    return "\n\n".join(lines)


class AIService:
    def __init__(self) -> None:
        self.use_mock = USE_MOCK_AI
        self.client = None
        if not self.use_mock:
            from openai import OpenAI

            self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        else:
            logger.warning("AIService using MOCK responses (no OpenAI key configured)")

        self.model = settings.OPENAI_MODEL
        self.max_tokens = settings.OPENAI_MAX_TOKENS
        self.temperature = settings.OPENAI_TEMPERATURE

    # ------------------------------------------------------------------ #
    # Prompt construction
    # ------------------------------------------------------------------ #

    def _build_system_prompt(
        self,
        subject: Optional[str],
        hits: Optional[List[Dict[str, Any]]],
    ) -> str:
        parts: List[str] = [BASE_SYSTEM_PROMPT]
        if subject:
            parts.append(f"CURRENT SUBJECT CONTEXT: {subject.replace('_', ' ').title()}")
        if hits:
            parts.append(CITATION_RULES)
            parts.append(_render_sources_block(hits))
        return "\n\n".join(parts)

    # ------------------------------------------------------------------ #
    # Mock generation
    # ------------------------------------------------------------------ #

    def _mock_response(
        self,
        user_message: str,
        subject: Optional[str],
        hits: Optional[List[Dict[str, Any]]],
    ) -> Dict[str, Any]:
        """
        Deterministic-ish mock. If RAG hits exist, splice in a [1] citation so
        the full UI pipeline is demoable without an API key.
        """
        time.sleep(random.uniform(0.6, 1.4))

        if hits:
            top = hits[0]
            title = top.get("document_title") or "your notes"
            page = top.get("page")
            loc = f", p. {page}" if page else ""
            snippet = (top.get("snippet") or "").strip()
            if len(snippet) > 220:
                snippet = snippet[:220] + "…"
            content = (
                f"Based on **{title}**{loc}, here's what's relevant to your question:\n\n"
                f"> {snippet} [1]\n\n"
                f"**In plain terms:** this passage directly addresses \"{user_message.strip()[:80]}\". "
                f"Try to restate the idea in your own words — then we can check it together.\n\n"
                f"_Offline demo mode: add an OpenAI API key for full responses._"
            )
        else:
            responses = [
                "Great question! Let me break this down:\n\n1. Start with the underlying principle\n2. Apply it to the specific case\n3. Check the answer makes sense\n\nWhich step would you like me to expand?",
                "Let's approach this step by step:\n\n- **Key idea:** identify what the problem is really asking\n- **Strategy:** pick the right framework\n- **Execution:** work through it carefully\n\nCan you try restating the question in your own words?",
                "Good instinct to ask. Here's a compact explanation:\n\n**Overview** — a short definition.\n**Why it matters** — how it connects to what you already know.\n**Practice** — try a mini-example and I'll check it.",
            ]
            content = random.choice(responses)
            if subject:
                content = f"**{subject.replace('_', ' ').title()}**\n\n" + content

        return {
            "content": content,
            "tokens_used": random.randint(120, 260),
            "model_used": "mock-gpt",
            "response_time": random.randint(700, 1600),
        }

    # ------------------------------------------------------------------ #
    # Public API
    # ------------------------------------------------------------------ #

    async def generate_response(
        self,
        user_message: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        subject: Optional[str] = None,
        rag_hits: Optional[List[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:
        """
        Generate an assistant response. If rag_hits is passed, they are rendered
        into the system prompt and the model is instructed to cite [n].
        """
        if self.use_mock:
            logger.info("MOCK AI: %d history msgs, %d hits", len(conversation_history or []), len(rag_hits or []))
            return self._mock_response(user_message, subject, rag_hits)

        try:
            start = time.time()
            system_prompt = self._build_system_prompt(subject, rag_hits)
            messages: List[Dict[str, str]] = [{"role": "system", "content": system_prompt}]

            if conversation_history:
                # Drop tool messages (not used yet); cap history length
                for m in conversation_history[-12:]:
                    role = m.get("role")
                    if role in ("user", "assistant") and m.get("content"):
                        messages.append({"role": role, "content": m["content"]})

            messages.append({"role": "user", "content": user_message})

            logger.info(
                "AI call: model=%s, history=%d, hits=%d",
                self.model, len(messages) - 2, len(rag_hits or []),
            )

            resp = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_tokens=self.max_tokens,
                temperature=self.temperature,
            )

            response_time = int((time.time() - start) * 1000)
            content = resp.choices[0].message.content or ""
            tokens_used = resp.usage.total_tokens if resp.usage else 0

            return {
                "content": content,
                "tokens_used": tokens_used,
                "model_used": self.model,
                "response_time": response_time,
            }
        except Exception as e:
            logger.exception("AI generation failed")
            raise Exception(f"Failed to generate AI response: {e}")

    async def generate_session_title(self, first_message: str) -> str:
        if self.use_mock:
            words = first_message.split()[:5]
            title = " ".join(words).strip()
            if len(title) > 50:
                title = title[:47] + "..."
            return title or "Study Session"

        try:
            resp = self.client.chat.completions.create(
                model="gpt-4.1-nano",
                messages=[
                    {
                        "role": "system",
                        "content": "Generate a short, descriptive title (max 6 words) for a study session based on the student's question. Only return the title, nothing else.",
                    },
                    {"role": "user", "content": first_message},
                ],
                max_tokens=20,
                temperature=0.6,
            )
            title = (resp.choices[0].message.content or "").strip().strip('"')
            return title[:100] or "Study Session"
        except Exception as e:
            logger.error("Title generation failed: %s", e)
            return "Study Session"


# Used by chat_service to strip citation markers that reference numbers the
# model hallucinated (e.g. [4] when only 3 sources were provided).
_CITATION_RE = re.compile(r"\[(\d+)\]")


def sanitize_citations(text: str, max_n: int) -> str:
    """Remove citation markers whose number is out of range."""
    if not text or max_n <= 0:
        # If no sources were provided, strip all markers defensively.
        return _CITATION_RE.sub("", text) if max_n == 0 else text

    def keep(match: "re.Match[str]") -> str:
        n = int(match.group(1))
        return match.group(0) if 1 <= n <= max_n else ""

    return _CITATION_RE.sub(keep, text)


ai_service = AIService()
