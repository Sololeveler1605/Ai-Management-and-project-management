"""
security.py
Password hashing and JWT creation/verification. Nothing in this file
should ever be imported by the frontend directly — only the backend uses it.
""" 

import os
from pathlib import Path
import bcrypt
from datetime import datetime, timedelta
from jose import jwt, JWTError
from dotenv import load_dotenv

# Ensure .env is loaded even if this module is imported before database.py.
_PROJECT_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(_PROJECT_ROOT / ".env")

JWT_SECRET = os.getenv("JWT_SECRET", "change-me")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

# NOTE: we use the `bcrypt` library directly instead of passlib.
# passlib's bcrypt backend has a known compatibility bug with bcrypt>=4.1
# (it crashes with "password cannot be longer than 72 bytes" even on short
# passwords, because of a broken self-test). Calling bcrypt directly avoids
# this entirely and is one less dependency to go stale.


def hash_password(plain_password: str) -> str:
    password_bytes = plain_password.encode("utf-8")
    hashed = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


def create_access_token(data: dict) -> str:
    """data should include at least: sub (user id), role, organization_id"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> dict:
    """Raises JWTError if the token is invalid or expired."""
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
