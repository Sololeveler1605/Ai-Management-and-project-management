"""
dependencies.py
The single security checkpoint for the whole application. Every protected
route imports get_current_user (or require_role) from here — no route
should ever implement its own auth logic. This is what makes the RBAC
system trustworthy: one gate, used everywhere, instead of one gate per
screen that someone could forget to add.

FastAPI auth dependencies: decode JWT and load the current user,
plus role guards used by every protected router.
"""

from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.orm import Session

from database import get_db
from security import decode_access_token
import models

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        user_uuid = UUID(str(user_id))
    except (JWTError, ValueError, TypeError):
        raise credentials_exception

    user = db.query(models.User).filter(models.User.id == user_uuid).first()
    if user is None or not user.is_active:
        raise credentials_exception
    return user


def require_role(allowed_roles: list[str]):
    """
    Dependency factory — restricts an endpoint to the given roles.

    Usage on any route:
        @router.post("/clients")
        def create_client(..., current_user: models.User = Depends(require_role(["admin"]))):
            ...
    """

    def role_checker(current_user: models.User = Depends(get_current_user)) -> models.User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"This action requires one of these roles: {', '.join(allowed_roles)}",
            )
        return current_user

    return role_checker