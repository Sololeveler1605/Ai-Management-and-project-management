# AI Project OS: Streamlit -> React conversion inventory

## Project boundary

- Project root: `E:\New folder\AI_project os`
- Backend: FastAPI in `backend/`, with SQLAlchemy/Alembic and PostgreSQL (SQLite-compatible local fallback in the database layer).
- Existing UI: Streamlit in `streamlit_app/`.
- Git metadata: not present in this checkout, so branch/status cannot be verified here.
- React target: `frontend/` inside this project root only.

## Runtime architecture

`frontend` -> HTTP bearer-token API -> FastAPI routers -> SQLAlchemy services/models -> database and AI/RAG/storage.

Authentication is `POST /auth/login` using OAuth2 form fields (`username` is the email), returning a JWT and serialized user. Roles are `admin`, `manager`, `employee`, and `client`; backend authorization remains authoritative through `get_current_user`, `require_role`, and project membership checks.

## Streamlit page map

| Role | Existing pages | React route/page |
|---|---|---|
| Admin | Dashboard, Clients, Projects, Documents, Meetings, Weekly Reports, Requirement Analyzer | `/admin/*` with the same sections |
| Manager | Dashboard, Clients, Projects, Tasks, Documents, Meetings, Weekly Reports, Requirement Analyzer | `/manager/*` with the same sections |
| Employee | Dashboard, My Tasks, My Projects, Documents | `/employee/*` with the same sections |
| Client | My Projects, Documents | `/client/*` with the same sections |
| All authenticated users | Shared AI Chat Assistant with optional document/RAG selection | Persistent chat panel |

The existing `employee.py` contains duplicated implementation blocks; the React implementation uses one shared page implementation while preserving the exposed workflow.

## Feature inventory

| Feature | Roles | Real backend/API | Data |
|---|---|---|---|
| Login/logout and protected navigation | all | `POST /auth/login`; JWT bearer | users, organizations |
| User directory / role counts | admin, manager | `GET /users` | users |
| Client CRUD | admin, manager | `GET/POST /clients`, `PUT/DELETE /clients/{id}` | clients |
| Projects, status/deadline, team assignment | admin, manager; read for employee/client | `GET/POST /projects`, `PATCH /projects/{id}`, `PUT/GET /projects/{id}/team` | projects, project_team_members |
| Tasks and status/priority/deadlines | admin, manager; assigned read/update for employee | `GET/POST /tasks`, `PATCH /tasks/{id}`, `PATCH /tasks/{id}/status`, `DELETE /tasks/{id}` | tasks |
| Jira issue details | manager and permitted users | `GET /tasks/{id}`, subtasks, comments, links endpoints | tasks, task_comments, task_links |
| Project modules/workflow | admin, manager; read for permitted users | `/projects/{id}/modules`, create/update/delete/reorder module endpoints | project_modules |
| Documents | all permitted roles | `/documents` list/upload/download/delete/reindex | documents, document_chunks |
| Client project dashboard | client | `GET /client-dashboard` | projects, tasks, documents, modules |
| Weekly reports | admin, manager | `POST/GET /weekly-reports/{project_id}` | weekly_reports |
| Meetings/audio summaries | admin, manager, employee | `/meetings/upload`, `/meetings/project/{id}`, `/meetings/{id}` | meetings, transcription/LLM services |
| Requirement Analyzer/review/approve/reject | admin, manager | `/ai/analyze-requirement`, `/ai/requirement-analyses/{id}`, approve/reject | requirement_analyses, tasks |
| AI task generation/status | permitted management users | `/ai/status`, `/ai/generate-tasks` | LLM/AI usage logs |
| Shared AI chat and RAG | all authenticated users | `POST /chat/query` plus document selection | documents, document_chunks, LLM |

## API surface used by the frontend

- `/`, `/auth/login`, `/auth/register`
- `/users`, `/clients`, `/projects`, `/projects/{id}/team`
- `/tasks` and Jira detail/subtask/comment/link routes
- `/projects/{id}/modules` and module mutation routes
- `/documents` upload/download/delete/reindex
- `/client-dashboard`, `/weekly-reports/{project_id}`, `/meetings/*`
- `/ai/status`, `/ai/generate-tasks`, `/ai/analyze-requirement`, requirement review routes
- `/chat/query`

## Conversion risks and verification notes

1. The checkout has no `.git` directory; source changes are confined to the project root but Git checks must be run by the repository owner.
2. Backend CORS currently allows `*`; production should restrict it to the deployed React origin.
3. Document indexing, RAG embeddings, transcription, and LLM calls can be slow and require optional environment keys/packages; UI must expose loading/error states.
4. OAuth2 login requires form-encoded credentials, not JSON.
5. Role access is enforced in the backend; React route guards are for UX only.
6. The current backend has no aggregate admin/manager KPI endpoint, so dashboards compose live `/projects`, `/tasks`, `/clients`, `/users`, and `/documents` responses.

## React implementation status

The new frontend will keep this source-of-truth mapping, use a centralized API client, persist only the JWT/user session (never application data), and expose explicit loading, empty, and error states for every API-driven section.

## Non-negotiable parity requirement

The Streamlit implementation is the visual and interaction source of truth. The React replacement is not accepted as complete until each existing role page has been checked screen-by-screen and every existing option is present: sidebar navigation, tabs, selectors, filters, cards, charts, forms, validation, modals/dialogs, upload/download/reindex controls, status transitions, task detail actions, module workflow controls, AI actions, and logout/session behavior. Labels, page hierarchy, colors, spacing, and workflows should remain equivalent unless a browser-specific implementation requires a mechanical adaptation.

The current React scaffold is an API-connected baseline, not the final parity milestone. Remaining parity work must be tracked against the full Streamlit source, especially the manager task-detail/Jira controls, project-module workflow UI, admin user/role sections, employee testing/notification sections, and client chart/document layouts.

### Parity work completed in the current pass

- Manager dashboard now includes the task phase donut, phase counts, document panel, upcoming deadlines, recent tasks, team activity, project task distribution chart, and quick-action cards.
- Manager Tasks now includes the four-column Jira board, title/status/priority filters, issue creation, issue detail modal, status/assignee/priority/date/label editing, subtasks, linked issues, comments, and deletion.
- All role project routes now use a project workspace with project selection, task progress chart, progress ring, modules, team, and documents; management roles can create projects and modules.
- The production build was rerun successfully after these changes.

The remaining parity pass still needs screen-by-screen reproduction of the specialized admin, employee, and client chart layouts and their remaining controls; those are not being represented as complete yet.
