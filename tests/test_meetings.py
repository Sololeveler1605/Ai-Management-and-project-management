"""
tests/test_meetings.py
Phase 2 — AI Meeting Summarizer.
Mocks Whisper + LLM; never hits real APIs.
"""

from __future__ import annotations

import io
import json
import uuid
from datetime import date
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Ensure backend/ is importable when pytest is run from repo root.
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1] / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from database import Base, get_db
from security import create_access_token, hash_password
import models
from main import app


SQLALCHEMY_DATABASE_URL = "sqlite://"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture()
def db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client(db):
    def _override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def _make_org(db, name="Test Org"):
    org = models.Organization(name=name)
    db.add(org)
    db.commit()
    db.refresh(org)
    return org


def _make_user(db, org, *, email, role, name=None, password="password123"):
    user = models.User(
        organization_id=org.id,
        name=name or role.title(),
        email=email,
        password_hash=hash_password(password),
        role=role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def _auth_header(user: models.User) -> dict:
    token = create_access_token(
        {
            "sub": str(user.id),
            "role": user.role,
            "organization_id": str(user.organization_id),
        }
    )
    return {"Authorization": f"Bearer {token}"}


def _make_project(db, org, admin_user, *, name="Alpha Project"):
    client_row = models.Client(
        organization_id=org.id,
        company_name="Acme Co",
        contact_name="Pat",
        email="pat@acme.test",
        status="active",
    )
    db.add(client_row)
    db.commit()
    db.refresh(client_row)

    project = models.Project(
        organization_id=org.id,
        client_id=client_row.id,
        name=name,
        description="Test project",
        status="active",
        deadline=date.today(),
        created_by=admin_user.id,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


MOCK_SUMMARY = {
    "summary": "Team reviewed sprint progress and blockers.",
    "action_items": ["Ship login fix", "Schedule design review"],
    "risks": ["API latency may slip the deadline"],
    "deadlines": ["Design review by Friday"],
}


def test_upload_happy_path_admin(client, db):
    org = _make_org(db)
    admin = _make_user(db, org, email="admin@test.com", role="admin")
    project = _make_project(db, org, admin)

    with (
        patch(
            "services.meeting_summarizer_service.transcribe_audio",
            return_value="We discussed sprint progress and blockers.",
        ) as mock_transcribe,
        patch(
            "services.meeting_summarizer_service.call_llm",
            return_value=json.dumps(MOCK_SUMMARY),
        ) as mock_llm,
    ):
        files = {"file": ("standup.wav", io.BytesIO(b"fake-audio-bytes"), "audio/wav")}
        data = {"project_id": str(project.id)}
        resp = client.post(
            "/meetings/upload",
            headers=_auth_header(admin),
            files=files,
            data=data,
        )

    assert resp.status_code == 202, resp.text
    body = resp.json()
    assert body["status"] == "done"
    meeting_id = body["id"]
    mock_transcribe.assert_called_once()
    mock_llm.assert_called()

    get_resp = client.get(f"/meetings/{meeting_id}", headers=_auth_header(admin))
    assert get_resp.status_code == 200, get_resp.text
    payload = get_resp.json()
    assert payload["status"] == "done"
    assert payload["summary"] == MOCK_SUMMARY["summary"]
    assert payload["action_items"] == MOCK_SUMMARY["action_items"]
    assert payload["risks"] == MOCK_SUMMARY["risks"]
    assert payload["deadlines"] == MOCK_SUMMARY["deadlines"]
    assert payload["transcript"]


def test_upload_no_token_401(client, db):
    org = _make_org(db)
    admin = _make_user(db, org, email="admin2@test.com", role="admin")
    project = _make_project(db, org, admin)

    files = {"file": ("standup.wav", io.BytesIO(b"x"), "audio/wav")}
    resp = client.post(
        "/meetings/upload",
        files=files,
        data={"project_id": str(project.id)},
    )
    assert resp.status_code == 401


def test_upload_client_role_403(client, db):
    org = _make_org(db)
    admin = _make_user(db, org, email="admin3@test.com", role="admin")
    client_user = _make_user(db, org, email="client@test.com", role="client")
    project = _make_project(db, org, admin)

    files = {"file": ("standup.wav", io.BytesIO(b"x"), "audio/wav")}
    resp = client.post(
        "/meetings/upload",
        headers=_auth_header(client_user),
        files=files,
        data={"project_id": str(project.id)},
    )
    assert resp.status_code == 403


def test_upload_employee_not_on_project_403(client, db):
    org = _make_org(db)
    admin = _make_user(db, org, email="admin4@test.com", role="admin")
    outsider = _make_user(db, org, email="emp-out@test.com", role="employee")
    project = _make_project(db, org, admin)
    # Deliberately do NOT add outsider to project_team_members.

    files = {"file": ("standup.wav", io.BytesIO(b"x"), "audio/wav")}
    resp = client.post(
        "/meetings/upload",
        headers=_auth_header(outsider),
        files=files,
        data={"project_id": str(project.id)},
    )
    assert resp.status_code == 403
    assert "You do not have access to this project" in resp.json()["detail"]


def test_malformed_llm_output_marks_failed(client, db):
    org = _make_org(db)
    admin = _make_user(db, org, email="admin5@test.com", role="admin")
    project = _make_project(db, org, admin)

    with (
        patch(
            "services.meeting_summarizer_service.transcribe_audio",
            return_value="Transcript about deadlines.",
        ),
        patch(
            "services.meeting_summarizer_service.call_llm",
            return_value="this is not json {{{",
        ),
    ):
        files = {"file": ("notes.wav", io.BytesIO(b"audio"), "audio/wav")}
        resp = client.post(
            "/meetings/upload",
            headers=_auth_header(admin),
            files=files,
            data={"project_id": str(project.id)},
        )

    assert resp.status_code == 202, resp.text
    assert resp.json()["status"] == "failed"
    meeting_id = resp.json()["id"]

    get_resp = client.get(f"/meetings/{meeting_id}", headers=_auth_header(admin))
    assert get_resp.status_code == 200
    assert get_resp.json()["status"] == "failed"
    assert get_resp.json()["status"] != "processing"
