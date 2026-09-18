"""
routers/meetings.py
Upload meeting audio and list AI-generated summaries per project.
Clients are excluded via require_role — meeting notes may contain
internal discussion not meant for client eyes.
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Optional
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from database import get_db
from dependencies import require_role
from project_access import (
    assert_manager_can_access_project,
    get_org_project_or_404,
    is_project_member,
)
import models
import schemas
from services.meeting_summarizer_service import process_meeting

router = APIRouter(prefix="/meetings", tags=["meetings"])

# Reuse Module 5 document storage root (subfolder for meetings).
UPLOAD_ROOT = Path(__file__).resolve().parent.parent / "uploaded_files" / "meetings"
UPLOAD_ROOT.mkdir(parents=True, exist_ok=True)

ALLOWED_AUDIO_EXTENSIONS = {".mp3", ".wav", ".m4a", ".ogg", ".webm", ".txt", ".md"}


def safe_filename(name: str) -> str:
    name = name or "meeting_audio"
    return re.sub(r"[^A-Za-z0-9_.-]", "_", name)


def _parse_json_list(raw: Optional[str]) -> Optional[list[str]]:
    if not raw:
        return None
    try:
        data = json.loads(raw)
        if isinstance(data, list):
            return [str(item) for item in data]
    except (json.JSONDecodeError, TypeError):
        pass
    return [raw] if raw.strip() else None


def serialize_meeting_summary(meeting: models.Meeting) -> schemas.MeetingSummaryOut:
    return schemas.MeetingSummaryOut(
        id=meeting.id,
        project_id=meeting.project_id,
        status=meeting.status,
        transcript=meeting.transcript,
        summary=meeting.summary,
        action_items=_parse_json_list(meeting.action_items),
        risks=_parse_json_list(meeting.risks),
        deadlines=_parse_json_list(meeting.deadlines),
        created_at=meeting.created_at,
    )


def _assert_can_access_project(db: Session, user: models.User, project_id: UUID) -> models.Project:
    """
    Admin / manager: any project in their organization (matches /projects + documents).
    Employee: must be on project_team_members for that project.
    Clients never reach here (blocked by require_role).
    """
    project = get_org_project_or_404(db, project_id, user.organization_id)
    if user.role == "admin":
        return project
    if user.role == "manager":
        assert_manager_can_access_project(db, user, project_id)
        return project
    if user.role == "employee":
        if not is_project_member(db, project_id, user.id):
            raise HTTPException(
                status_code=403,
                detail="You do not have access to this project.",
            )
        return project
    raise HTTPException(status_code=403, detail="You do not have access to this project.")


@router.post(
    "/upload",
    response_model=schemas.MeetingUploadResponse,
    status_code=status.HTTP_202_ACCEPTED,
)
def upload_meeting(
    project_id: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role(["admin", "manager", "employee"])),
):
    try:
        parsed_project_id = UUID(project_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid project_id format")

    _assert_can_access_project(db, current_user, parsed_project_id)

    clean_name = safe_filename(file.filename)
    suffix = Path(clean_name).suffix.lower()
    if suffix and suffix not in ALLOWED_AUDIO_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Unsupported file type '{suffix}'. "
                f"Allowed: {', '.join(sorted(ALLOWED_AUDIO_EXTENSIONS))}"
            ),
        )

    unique_name = f"{uuid4()}_{clean_name}"
    storage_path = UPLOAD_ROOT / unique_name
    storage_path.write_bytes(file.file.read())

    meeting = models.Meeting(
        organization_id=current_user.organization_id,
        project_id=parsed_project_id,
        uploaded_by=current_user.id,
        audio_file_url=str(storage_path),
        status="processing",
    )
    db.add(meeting)
    db.commit()
    db.refresh(meeting)

    # Phase 2: process synchronously (no Celery/Redis). Volume is low enough.
    process_meeting(meeting.id, db)
    db.refresh(meeting)

    return schemas.MeetingUploadResponse(id=meeting.id, status=meeting.status)


@router.get("/project/{project_id}", response_model=list[schemas.MeetingSummaryOut])
def list_project_meetings(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role(["admin", "manager", "employee"])),
):
    _assert_can_access_project(db, current_user, project_id)
    meetings = (
        db.query(models.Meeting)
        .filter(
            models.Meeting.organization_id == current_user.organization_id,
            models.Meeting.project_id == project_id,
        )
        .order_by(models.Meeting.created_at.desc())
        .all()
    )
    return [serialize_meeting_summary(m) for m in meetings]


@router.get("/{meeting_id}", response_model=schemas.MeetingSummaryOut)
def get_meeting(
    meeting_id: UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role(["admin", "manager", "employee"])),
):
    meeting = (
        db.query(models.Meeting)
        .filter(
            models.Meeting.id == meeting_id,
            models.Meeting.organization_id == current_user.organization_id,
        )
        .first()
    )
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    _assert_can_access_project(db, current_user, meeting.project_id)
    return serialize_meeting_summary(meeting)
