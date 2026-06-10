"""
Minimal tool abstraction compatible with OpenAI function-calling.

A Tool is a self-describing callable:
    - name, description, JSON-schema for arguments
    - run(**kwargs) -> ToolResult
"""

from __future__ import annotations

import time
from dataclasses import dataclass, field
from typing import Any, Callable, Dict, Optional


class ToolError(Exception):
    """Raised by a tool to report a graceful, user-facing failure."""


@dataclass
class ToolResult:
    """Result returned by a tool invocation."""

    output: Any                          # JSON-serializable result
    display: Optional[str] = None        # short human-readable summary
    duration_ms: int = 0
    error: Optional[str] = None
    meta: Dict[str, Any] = field(default_factory=dict)

    def as_dict(self) -> Dict[str, Any]:
        return {
            "output": self.output,
            "display": self.display,
            "duration_ms": self.duration_ms,
            "error": self.error,
            "meta": self.meta,
        }


@dataclass
class Tool:
    name: str
    description: str
    parameters: Dict[str, Any]  # JSON Schema
    fn: Callable[..., ToolResult]
    # When true, the assistant is encouraged to call the tool first for matching
    # questions (e.g. math / code), not last. The bias is communicated in prompts,
    # not enforced here.
    prefer: bool = False

    def openai_schema(self) -> Dict[str, Any]:
        return {
            "type": "function",
            "function": {
                "name": self.name,
                "description": self.description,
                "parameters": self.parameters,
            },
        }

    def invoke(self, **kwargs) -> ToolResult:
        start = time.time()
        try:
            result = self.fn(**kwargs)
            if not isinstance(result, ToolResult):
                result = ToolResult(output=result)
        except ToolError as e:
            result = ToolResult(output=None, error=str(e))
        except Exception as e:  # pragma: no cover — defensive
            result = ToolResult(output=None, error=f"Tool crashed: {e}")
        result.duration_ms = int((time.time() - start) * 1000)
        return result
