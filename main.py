"""Workspace-root ASGI entry point.

Run from the repository root:
    python -m uvicorn main:app --reload
"""

import sys
from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parent / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from backend.main import app  # noqa: E402,F401
