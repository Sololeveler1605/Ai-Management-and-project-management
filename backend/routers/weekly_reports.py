"""
routers/weekly_reports.py
Generate and list weekly progress reports for a project.
"""

from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from dependencies import get_current_user, require_role
from project_access import (
    assert_manager_can_access_project,
    get_org_project_or_404,
    is_project_member,
)
import models
import schemas
from routers.weekly_report_services import generate_report

router = APIRouter(prefix="/weekly-reports", tags=["weekly-reports"])


def _assert_can_access_project(db: Session, user: models.User, project_id: UUID) -> models.Project:
    project = get_org_project_or_404(db, project_id, user.organization_id)
    if user.role == "admin":
        return project
    if user.role == "manager":
        assert_manager_can_access_project(db, user, project_id)
        return project
    if user.role == "employee":
        if not is_project_member(db, project_id, user.id):
            raise HTTPException(status_code=403, detail="Not authorized for this project")
        return project
    raise HTTPException(status_code=403, detail="Not authorized")


@router.post(
    "/{project_id}",
    response_model=schemas.WeeklyReportOut,
    status_code=status.HTTP_201_CREATED,
)
def create_weekly_report(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role(["admin", "manager"])),
):
    _assert_can_access_project(db, current_user, project_id)
    report_text = generate_report(db, project_id)
    report = models.WeeklyReport(
        organization_id=current_user.organization_id,
        project_id=project_id,
        report_text=report_text,
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


@router.get("/{project_id}", response_model=list[schemas.WeeklyReportOut])
def list_weekly_reports(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    _assert_can_access_project(db, current_user, project_id)
    reports = (
        db.query(models.WeeklyReport)
        .filter(
            models.WeeklyReport.organization_id == current_user.organization_id,
            models.WeeklyReport.project_id == project_id,
        )
        .order_by(models.WeeklyReport.created_at.desc())
        .all()
    )
    return reports
