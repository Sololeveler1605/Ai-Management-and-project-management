"""
services/meeting_summarizer_service.py
Transcribe a meeting audio file and summarize it with the LLM.
"""

from __future__ import annotations

import json
from pathlib import Path
from uuid import UUID

from pydantic import BaseModel, ValidationError
from sqlalchemy.orm import Session

import models
from ai.llm_client import call_llm
from ai.transcription import transcribe_audio

_PROMPT_PATH = Path(__file__).resolve().parent.parent / "ai" / "prompts" / "meeting_summary.txt"


def _build_prompt(transcript: str) -> str:
    template = _PROMPT_PATH.read_text(encoding="utf-8")
    return template.replace("{transcript}", transcript)


class MeetingSummaryParsed(BaseModel):
    summary: str
    action_items: list[str]
    risks: list[str]
    deadlines: list[str]


def _parse_llm_response(raw: str) -> MeetingSummaryParsed:
    cleaned = raw.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.strip("`\n")
        if cleaned.lower().startswith("json"):
            cleaned = cleaned[4:].strip()
    data = json.loads(cleaned)
    return MeetingSummaryParsed(**data)


def process_meeting(meeting_id: UUID, db: Session) -> None:
    meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not meeting:
        return

    try:
        transcript = transcribe_audio(meeting.audio_file_url)
        meeting.transcript = transcript

        prompt = _build_prompt(transcript)
        raw_response = call_llm(prompt)

        try:
            parsed = _parse_llm_response(raw_response)
        except (json.JSONDecodeError, ValidationError, TypeError):
            retry_prompt = (
                prompt + "\n\nIMPORTANT: Return valid JSON only, no markdown formatting."
            )
            raw_response = call_llm(retry_prompt)
            parsed = _parse_llm_response(raw_response)

        meeting.summary = parsed.summary
        meeting.action_items = json.dumps(parsed.action_items)
        meeting.risks = json.dumps(parsed.risks)
        meeting.deadlines = json.dumps(parsed.deadlines)
        meeting.status = "done"

    except Exception as exc:
        meeting.status = "failed"
        meeting.summary = f"Processing error: {str(exc)[:200]}"

    db.commit()
