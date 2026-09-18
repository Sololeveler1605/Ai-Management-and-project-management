# AI Project OS React frontend

This frontend is the React/Vite UI for AI Project OS. It keeps the FastAPI backend as the source of truth and sends bearer-authenticated requests to it.

## Run locally

1. Start the existing API from `backend/`:

   `python -m uvicorn main:app --port 8000 --host 127.0.0.1`

2. Install and start the frontend:

   `cd frontend`

   `npm install`

   `npm run dev`

3. Copy `.env.example` to `.env` if the API is not at `http://127.0.0.1:8000`.

The local backend seeds `admin@example.com` / `password123` when it is configured for SQLite. Production credentials remain managed by the backend and are never hardcoded in React.

## Production build

`npm run build` writes the deployable bundle to `frontend/dist`.

## Implemented API-backed areas

JWT login/logout and role guards; admin/manager/employee/client navigation; live dashboards; client CRUD; project creation/status/team fields; task creation/status/deletion; document upload/download/delete/reindex; project reports; meeting upload/list; requirement analysis review/approve/reject; and shared AI chat with optional document IDs for RAG.

The application consists of this React frontend and the FastAPI backend.
