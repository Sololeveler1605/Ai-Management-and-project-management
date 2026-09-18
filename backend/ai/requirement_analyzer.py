"""
ai/requirement_analyzer.py
Turn a requirement document's text into a structured Epics -> Stories ->
Tasks breakdown using the shared call_llm() wrapper.

Follows the exact same retry-once-then-fail + Pydantic validation pattern
as services/meeting_summarizer_service.py. Every LLM invocation is logged
to ai_usage_log with feature="requirement_analysis".
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Optional
from uuid import UUID

from pydantic import ValidationError
from sqlalchemy.orm import Session

import models
from ai.llm_client import call_llm
from schemas import RequirementAnalysisOut

_PROMPT_PATH = (
    Path(__file__).resolve().parent / "prompts" / "requirement_analysis.txt"
)


def _build_prompt(document_text: str) -> str:
    template = _PROMPT_PATH.read_text(encoding="utf-8")
    return template.replace("{document_text}", document_text or "")


def _log_usage(
    db: Session,
    *,
    organization_id: UUID,
    user_id: Optional[UUID],
    feature: str,
    model: Optional[str],
    status: str,
    prompt_tokens: Optional[str] = None,
    completion_tokens: Optional[str] = None,
) -> None:
    """Insert one row into ai_usage_log for the AI call."""
    log_row = models.AIUsageLog(
        organization_id=organization_id,
        user_id=user_id,
        feature=feature,
        model=model,
        prompt_tokens=prompt_tokens,
        completion_tokens=completion_tokens,
        status=status,
    )
    db.add(log_row)


def _parse_llm_response(raw: str) -> RequirementAnalysisOut:
    cleaned = raw.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.strip("`\n")
        if cleaned.lower().startswith("json"):
            cleaned = cleaned[4:].strip()
    data = json.loads(cleaned)
    return RequirementAnalysisOut(**data)


def analyze_requirement_document(
    document_text: str,
    db: Session,
    *,
    organization_id: UUID,
    user_id: Optional[UUID],
) -> RequirementAnalysisOut:
    """
    Build the prompt, call the LLM, parse + validate the structured output.
    On validation/parse failure, retries ONCE with an error-correction
    message appended, then raises a clear exception if it still fails.

    Logs every call to ai_usage_log with feature="requirement_analysis".
    """
    model = "gemini"  # resolved via call_llm (reads OPENAI_MODEL/LLM_MODEL env)
    prompt = _build_prompt(document_text)

    raw_response = call_llm(prompt)
    _log_usage(
        db,
        organization_id=organization_id,
        user_id=user_id,
        feature="requirement_analysis",
        model=model,
        status="success",
    )

    try:
        return _parse_llm_response(raw_response)
    except (json.JSONDecodeError, ValidationError, TypeError, KeyError):
        retry_prompt = (
            prompt
            + "\n\nIMPORTANT: The previous response was not valid JSON matching "
            "the required schema. Return ONLY valid JSON with epics -> stories, "
            "each story having title, description, and priority (low/medium/high). "
            "No markdown, no commentary."
        )
        retry_raw = call_llm(retry_prompt)
        _log_usage(
            db,
            organization_id=organization_id,
            user_id=user_id,
            feature="requirement_analysis",
            model=model,
            status="retry",
        )
        return _parse_llm_response(retry_raw)
