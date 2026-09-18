"""
routers/requirement_analyzer.py
AI Requirement Analyzer:
  - POST /ai/analyze-requirement      (admin/manager) -> analyze a document, save pending_review row
  - GET  /ai/requirement-analyses/{id}                 -> fetch one for review
  - POST /ai/requirement-analyses/{id}/approve         -> create real Tasks via Module 4 logic
  - POST /ai/requirement-analyses/{id}/reject          -> mark rejected, no tasks

organization_id is enforced on every query/insert so a manager can only
analyze/approve documents within their own organization.
"""

from __future__ import annotations

from pathlib import Path
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ai.requirement_analyzer import analyze_requirement_document
from database import get_db
from dependencies import require_role
from models import Document, Project, RequirementAnalysis, User
from project_access import assert_manager_can_access_project
from rag_utils import extract_text
from routers.tasks import create_task_record
from schemas import (
    RequirementAnalysisOut,
    RequirementAnalysisResult,
    RequirementAnalyzeRequest,
    RequirementApproveResponse,
    RequirementReviewApproveRequest,
)

router = APIRouter(prefix="/ai", tags=["ai"])

UPLOAD_ROOT = Path(__file__).resolve().parent.parent / "uploaded_files"


def _get_analysis_for_user(
    db: Session,
    analysis_id: UUID,
    current_user: User,
) -> RequirementAnalysis:
    analysis = (
        db.query(RequirementAnalysis)
        .filter(
            RequirementAnalysis.id == analysis_id,
            RequirementAnalysis.organization_id == current_user.organization_id,
        )
        .first()
    )
    if not analysis:
        raise HTTPException(status_code=404, detail="Requirement analysis not found")
    return analysis


def _require_analysis_out(raw) -> RequirementAnalysisOut:
    """Build a RequirementAnalysisOut from a raw stored dict."""
    return RequirementAnalysisOut(**raw)


@router.post("/analyze-requirement", response_model=RequirementAnalysisResult)
def analyze_requirement(
    payload: RequirementAnalyzeRequest,
    current_user=Depends(require_role(["admin", "manager"])),
    db: Session = Depends(get_db),
):
    # Project must belong to the caller's org.
    project = (
        db.query(Project)
        .filter(
            Project.id == payload.project_id,
            Project.organization_id == current_user.organization_id,
        )
        .first()
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    assert_manager_can_access_project(db, current_user, payload.project_id)

    # Document must belong to the caller's org (and same project if linked).
    document = (
        db.query(Document)
        .filter(
            Document.id == payload.document_id,
            Document.organization_id == current_user.organization_id,
        )
        .first()
    )
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    if document.project_id is not None and document.project_id != payload.project_id:
        raise HTTPException(
            status_code=403,
            detail="Document does not belong to the selected project",
        )

    path = Path(document.storage_path)
    if not path.is_file():
        raise HTTPException(
            status_code=404,
            detail="Document file is missing from storage; re-upload the file.",
        )

    document_text = extract_text(str(path))
    if not document_text or not document_text.strip():
        raise HTTPException(
            status_code=400,
            detail="No text could be extracted from this document to analyze.",
        )

    breakdown = analyze_requirement_document(
        document_text,
        db,
        organization_id=current_user.organization_id,
        user_id=current_user.id,
    )

    analysis = RequirementAnalysis(
        organization_id=current_user.organization_id,
        project_id=payload.project_id,
        document_id=document.id,
        raw_output=breakdown.model_dump(),
        status="pending_review",
        created_by=current_user.id,
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    return RequirementAnalysisResult(
        id=analysis.id,
        project_id=analysis.project_id,
        document_id=analysis.document_id,
        status=analysis.status,
        breakdown=breakdown,
        created_at=analysis.created_at,
    )


@router.get("/requirement-analyses/{analysis_id}", response_model=RequirementAnalysisResult)
def get_requirement_analysis(
    analysis_id: UUID,
    current_user=Depends(require_role(["admin", "manager"])),
    db: Session = Depends(get_db),
):
    analysis = _get_analysis_for_user(db, analysis_id, current_user)
    return RequirementAnalysisResult(
        id=analysis.id,
        project_id=analysis.project_id,
        document_id=analysis.document_id,
        status=analysis.status,
        breakdown=_require_analysis_out(analysis.raw_output),
        created_at=analysis.created_at,
    )


@router.post(
    "/requirement-analyses/{analysis_id}/approve",
    response_model=RequirementApproveResponse,
)
def approve_requirement_analysis(
    analysis_id: UUID,
    payload: RequirementReviewApproveRequest,
    current_user=Depends(require_role(["admin", "manager"])),
    db: Session = Depends(get_db),
):
    analysis = _get_analysis_for_user(db, analysis_id, current_user)
    if analysis.status != "pending_review":
        raise HTTPException(
            status_code=400,
            detail=f"Analysis is already {analysis.status}",
        )

    assert_manager_can_access_project(db, current_user, analysis.project_id)

    task_ids = []
    for epic in payload.epics:
        for story in epic.stories:
            task = create_task_record(
                db,
                organization_id=current_user.organization_id,
                project_id=analysis.project_id,
                title=story.title,
                description=(
                    f"{story.description}\n\n[Epic: {epic.title}]"
                    if epic.title
                    else story.description
                ),
                epic=epic.title,
                status="todo",
                assigned_to=None,
                created_by=current_user.id,
            )
            task_ids.append(task.id)

    analysis.status = "approved"
    db.commit()
    db.refresh(analysis)

    return RequirementApproveResponse(analysis_id=analysis.id, task_ids=task_ids)


@router.post("/requirement-analyses/{analysis_id}/reject")
def reject_requirement_analysis(
    analysis_id: UUID,
    current_user=Depends(require_role(["admin", "manager"])),
    db: Session = Depends(get_db),
):
    analysis = _get_analysis_for_user(db, analysis_id, current_user)
    if analysis.status != "pending_review":
        raise HTTPException(
            status_code=400,
            detail=f"Analysis is already {analysis.status}",
        )
    analysis.status = "rejected"
    db.commit()
    return {"analysis_id": analysis.id, "status": analysis.status}
