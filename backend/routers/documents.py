"""
documents.py
Upload / list / download / delete documents.

Project-linked documents are shared between staff and the client that owns
the project: admin uploads to a project → that client can see & preview;
client uploads to their project → admin/manager can see it too.
"""

from __future__ import annotations

from pathlib import Path
from typing import Optional
from uuid import UUID, uuid4
import re

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from dependencies import get_current_user
from project_access import (
    assert_manager_can_access_project,
    is_project_member,
    manager_or_employee_project_ids,
)
from rag_utils import (
    delete_chunks_for_document,
    chunk_count_for_document,
    process_document_for_rag,
)
import models
import schemas

router = APIRouter(prefix="/documents", tags=["documents"])

UPLOAD_ROOT = Path(__file__).resolve().parent.parent / "uploaded_files"
UPLOAD_ROOT.mkdir(parents=True, exist_ok=True)


def safe_filename(name: str) -> str:
    name = name or "upload"
    return re.sub(r"[^A-Za-z0-9_.-]", "_", name)


def serialize_document(
    document: models.Document,
    db: Optional[Session] = None,
    chunk_count: Optional[int] = None,
) -> schemas.DocumentOut:
    if chunk_count is None and db is not None:
        chunk_count = chunk_count_for_document(db, document.id)
    return schemas.DocumentOut(
        id=document.id,
        organization_id=document.organization_id,
        project_id=document.project_id,
        filename=document.filename,
        uploaded_by=document.uploaded_by,
        uploaded_at=document.uploaded_at,
        chunk_count=chunk_count or 0,
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


def _get_project_or_404(db: Session, project_id: UUID, organization_id: UUID) -> models.Project:
    project = (
        db.query(models.Project)
        .filter(
            models.Project.id == project_id,
            models.Project.organization_id == organization_id,
        )
        .first()
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


def _assert_can_use_project(db: Session, current_user: models.User, project: models.Project) -> None:
    if current_user.role == "client":
        client = _client_profile(db, current_user)
        if not client or project.client_id != client.id:
            raise HTTPException(
                status_code=403,
                detail="You can only upload documents to your own projects.",
            )
    elif current_user.role == "manager":
        assert_manager_can_access_project(db, current_user, project.id)
    elif current_user.role == "employee":
        if not is_project_member(db, project.id, current_user.id):
            raise HTTPException(
                status_code=403,
                detail="You can only upload documents to projects you are assigned to.",
            )
    # admin: any project in org


def _assert_can_access_document(db: Session, current_user: models.User, document: models.Document) -> None:
    if document.organization_id != current_user.organization_id:
        raise HTTPException(status_code=404, detail="Document not found")

    if current_user.role in {"admin", "manager"}:
        return

    if document.project_id is None:
        raise HTTPException(status_code=403, detail="Not authorized to access this document")

    if current_user.role == "client":
        allowed = _client_project_ids(db, current_user)
        if document.project_id not in allowed:
            raise HTTPException(status_code=403, detail="Not authorized to access this document")
        return

    if current_user.role == "employee":
        allowed = manager_or_employee_project_ids(db, current_user.id)
        if document.project_id not in allowed:
            raise HTTPException(status_code=403, detail="Not authorized to access this document")
        return

    raise HTTPException(status_code=403, detail="Not authorized to access this document")

@router.post("/upload", response_model=schemas.DocumentOut, status_code=status.HTTP_201_CREATED)
def upload_document(
    file: UploadFile = File(...),
    project_id: str = Form(None),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    parsed_project_id = None
    if project_id and project_id.strip():
        try:
            parsed_project_id = UUID(project_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid project_id format")

    # Clients must attach uploads to one of their projects
    if current_user.role == "client":
        if parsed_project_id is None:
            raise HTTPException(
                status_code=400,
                detail="Please select a project when uploading a document.",
            )
        project = _get_project_or_404(db, parsed_project_id, current_user.organization_id)
        _assert_can_use_project(db, current_user, project)
    elif parsed_project_id is not None:
        project = _get_project_or_404(db, parsed_project_id, current_user.organization_id)
        _assert_can_use_project(db, current_user, project)

    clean_name = safe_filename(file.filename)
    unique_name = f"{uuid4()}_{clean_name}"
    storage_path = UPLOAD_ROOT / unique_name

    file_bytes = file.file.read()
    storage_path.write_bytes(file_bytes)

    document = models.Document(
        organization_id=current_user.organization_id,
        project_id=parsed_project_id,
        filename=clean_name,
        storage_path=str(storage_path),
        uploaded_by=current_user.id,
    )
    db.add(document)
    db.commit()
    db.refresh(document)

    # Index immediately so Documents + AI Chat see chunk_count on the same
    # response (background indexing left files looking "not indexed").
    try:
        chunks = process_document_for_rag(
            db,
            document.id,
            document.storage_path,
            document.organization_id,
            document.project_id,
        )
    except Exception as exc:
        # A cold model load / transient embedding failure must not fail the
        # upload — the file is already saved. Report chunk_count=0 so the UI
        # offers Reindex, which retries indexing on demand.
        try:
            db.rollback()
        except Exception:
            pass
        print(
            f"RAG indexing skipped on upload for document {document.id}: "
            f"{type(exc).__name__}: {exc}"
        )
        chunks = 0
    return serialize_document(document, db=db, chunk_count=chunks)


@router.get("", response_model=list[schemas.DocumentOut])
def list_documents(
    project_id: Optional[UUID] = None,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(models.Document).filter(
        models.Document.organization_id == current_user.organization_id
    )

    if current_user.role == "client":
        allowed = _client_project_ids(db, current_user)
        if not allowed:
            return []
        if project_id is not None:
            if project_id not in allowed:
                raise HTTPException(status_code=403, detail="Not authorized for this project")
            query = query.filter(models.Document.project_id == project_id)
        else:
            query = query.filter(models.Document.project_id.in_(allowed))
    elif current_user.role == "employee":
        allowed = manager_or_employee_project_ids(db, current_user.id)
        if not allowed:
            return []
        if project_id is not None:
            if project_id not in allowed:
                raise HTTPException(status_code=403, detail="Not authorized for this project")
            query = query.filter(models.Document.project_id == project_id)
        else:
            query = query.filter(models.Document.project_id.in_(allowed))
    elif current_user.role in {"admin", "manager"}:
        if project_id is not None:
            _get_project_or_404(db, project_id, current_user.organization_id)
            query = query.filter(models.Document.project_id == project_id)
    else:
        raise HTTPException(status_code=403, detail="Not authorized")

    documents = query.order_by(models.Document.uploaded_at.desc()).all()
    if not documents:
        return []

    # One grouped count query instead of N per-document lookups.
    doc_ids = [doc.id for doc in documents]
    count_rows = (
        db.query(models.DocumentChunk.document_id, func.count(models.DocumentChunk.id))
        .filter(models.DocumentChunk.document_id.in_(doc_ids))
        .group_by(models.DocumentChunk.document_id)
        .all()
    )
    counts = {doc_id: n for doc_id, n in count_rows}
    return [
        serialize_document(doc, chunk_count=counts.get(doc.id, 0))
        for doc in documents
    ]


@router.post("/{document_id}/reindex", response_model=schemas.ReindexResult)
def reindex_document(
    document_id: UUID,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Re-run RAG text extraction + embedding for an existing upload.
    Use when a file shows chunk_count=0 (indexing failed, still pending,
    or uploaded before RAG was enabled).
    """
    document = (
        db.query(models.Document)
        .filter(models.Document.id == document_id)
        .first()
    )
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    _assert_can_access_document(db, current_user, document)

    if current_user.role not in {"admin", "manager", "client", "employee"}:
        raise HTTPException(status_code=403, detail="Not authorized")

    if not Path(document.storage_path).is_file():
        raise HTTPException(
            status_code=404,
            detail="Document file is missing from storage; re-upload the file.",
        )

    try:
        chunks = process_document_for_rag(
            db,
            document.id,
            document.storage_path,
            document.organization_id,
            document.project_id,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"RAG indexing failed: {type(exc).__name__}: {exc}",
        ) from exc

    status_label = "indexed" if chunks > 0 else "no_text_extracted"
    return schemas.ReindexResult(
        document_id=document.id,
        filename=document.filename,
        chunks_indexed=chunks,
        status=status_label,
    )


@router.get("/{document_id}/download")
def download_document(
    document_id: UUID,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    document = (
        db.query(models.Document)
        .filter(models.Document.id == document_id)
        .first()
    )
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    _assert_can_access_document(db, current_user, document)

    return FileResponse(
        path=document.storage_path,
        filename=document.filename,
        media_type="application/octet-stream",
    )


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    document_id: UUID,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    document = (
        db.query(models.Document)
        .filter(models.Document.id == document_id)
        .first()
    )
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    _assert_can_access_document(db, current_user, document)

    # Admin / manager can delete any accessible document. Clients can delete
    # documents from their own projects; employees can delete only files they uploaded.
    if current_user.role == "employee" and document.uploaded_by != current_user.id:
        raise HTTPException(status_code=403, detail="Employees can only delete their own uploads")
    if current_user.role not in {"admin", "manager", "client", "employee"}:
        raise HTTPException(status_code=403, detail="Not permitted to delete documents")

    # Clean up RAG chunks in the same transaction as the document delete
    # so a deleted file's content can never surface in future chat answers.
    delete_chunks_for_document(db, document.id, commit=False)

    try:
        Path(document.storage_path).unlink(missing_ok=True)
    except Exception:
        pass

    db.delete(document)
    db.commit()
    return None
