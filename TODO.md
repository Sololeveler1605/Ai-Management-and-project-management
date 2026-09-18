# AI Requirement Analyzer — Implementation TODO

## Backend
- [ ] 1. models.py — add `AIUsageLog`, `RequirementAnalysis` tables; add `epic` to `Task`
- [ ] 2. schemas.py — add `epic` to TaskCreate/TaskOut
- [ ] 3. routers/tasks.py — pass `epic` through to Task on create
- [ ] 4. backend/schemas/requirement_analyzer.py — Pydantic schemas for LLM output + API
- [ ] 5. backend/ai/prompts/requirement_analysis.txt — prompt template
- [ ] 6. backend/ai/requirement_analyzer.py — analyze + AI usage logging (retry-once-then-fail)
- [ ] 7. backend/routers/requirement_analyzer.py — API endpoints (analyze/get/approve/reject)
- [ ] 8. backend/main.py — register router
- [ ] 9. Generate Alembic migration, review, show user

## Frontend
- [ ] 10. frontend/src/api/client.js — requirement analyzer API wrappers
- [ ] 11. frontend/src/pages/roles/manager/Manager.jsx — Requirement Analyzer page

## Verify
- [ ] 12. Run alembic upgrade head, boot backend, manual test checklist
