from __future__ import annotations

from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from schemas import ChatQuery, ChatResponse
from services.chat_assistant_service import get_chat_response
from dependencies import get_current_user
from project_access import manager_or_employee_project_ids
import models

router = APIRouter(
    prefix="/chat",
    tags=["AI Chat Assistant"],
)


def _client_profile(db: Session, current_user: models.User) -> Optional[models.Client]:
    return (
        db.query(models.Client)
        .filter(
            func.lower(models.Client.email) == current_user.email.lower(),
            models.Client.organization_id == current_user.organization_id,
        )
        .first()
    )


def _client_project_ids(db: Session, current_user: models.User) -> list[UUID]:
    client = _client_profile(db, current_user)
    if not client:
        return []
    rows = (
        db.query(models.Project.id)
        .filter(
            models.Project.client_id == client.id,
            models.Project.organization_id == current_user.organization_id,
        )
        .all()
    )
    return [row[0] for row in rows]


def _accessible_document_ids(
    db: Session,
    current_user: models.User,
    requested_ids: Optional[list[UUID]],
    project_id: Optional[UUID],
) -> Optional[list[UUID]]:
    """
    Resolve which document IDs the caller may use for RAG.

    Returns:
    - None  → no document filter (search all accessible org docs; project_id
              may still scope retrieval in rag_utils)
    - list  → explicit allow-list (may be empty if nothing is accessible)
    """
    if requested_ids is None and project_id is None:
        # Unscoped chat: for restricted roles, still limit to their projects
        # so they never retrieve chunks from docs they cannot open.
        if current_user.role in {"admin", "manager"}:
            return None
        if current_user.role == "client":
            allowed_projects = _client_project_ids(db, current_user)
            if not allowed_projects:
                return []
            rows = (
                db.query(models.Document.id)
                .filter(
                    models.Document.organization_id == current_user.organization_id,
                    models.Document.project_id.in_(allowed_projects),
                )
                .all()
            )
            return [r[0] for r in rows]
        if current_user.role == "employee":
            allowed_projects = manager_or_employee_project_ids(db, current_user.id)
            if not allowed_projects:
                return []
            rows = (
                db.query(models.Document.id)
                .filter(
                    models.Document.organization_id == current_user.organization_id,
                    models.Document.project_id.in_(allowed_projects),
                )
                .all()
            )
            return [r[0] for r in rows]
        return []

    query = db.query(models.Document).filter(
        models.Document.organization_id == current_user.organization_id
    )

    if current_user.role == "client":
        allowed_projects = _client_project_ids(db, current_user)
        if not allowed_projects:
            return []
        query = query.filter(models.Document.project_id.in_(allowed_projects))
    elif current_user.role == "employee":
        allowed_projects = manager_or_employee_project_ids(db, current_user.id)
        if not allowed_projects:
            return []
        query = query.filter(models.Document.project_id.in_(allowed_projects))
    elif current_user.role not in {"admin", "manager"}:
        raise HTTPException(status_code=403, detail="Not authorized")

    if project_id is not None:
        query = query.filter(models.Document.project_id == project_id)

    if requested_ids is not None:
        query = query.filter(models.Document.id.in_(requested_ids))

    return [doc.id for doc in query.all()]


@router.post("/query", response_model=ChatResponse)
def chat_query(
    payload: ChatQuery,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if not payload.message or not payload.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    # Validate project belongs to this org when provided.
    if payload.project_id is not None:
        project = (
            db.query(models.Project)
            .filter(
                models.Project.id == payload.project_id,
                models.Project.organization_id == current_user.organization_id,
            )
            .first()
        )
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

    explicit_doc_selection = payload.document_ids is not None

    document_ids = _accessible_document_ids(
        db,
        current_user,
        payload.document_ids,
        payload.project_id,
    )

    # If the client asked for specific documents, reject any they can't access.
    if explicit_doc_selection:
        allowed = set(document_ids or [])
        missing = [str(d) for d in payload.document_ids if d not in allowed]
        if missing:
            raise HTTPException(
                status_code=403,
                detail=f"Not authorized to use document(s): {', '.join(missing)}",
            )

    answer = get_chat_response(
        payload.message,
        db,
        current_user.organization_id,
        user_id=current_user.id,
        project_id=payload.project_id,
        document_ids=document_ids,
        use_rag_only=explicit_doc_selection,
    )
    return ChatResponse(answer=answer)
