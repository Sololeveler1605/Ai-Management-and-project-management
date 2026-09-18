"""
routers/auth.py
Module 1 — Authentication & Roles.
POST /auth/register — creates a new user (in the real product, restrict
                       this to Admins inviting people; left open here so
                       you can create your first user during development).
POST /auth/login    — verifies credentials, returns a JWT.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas
from security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=schemas.UserOut)
def register(payload: schemas.UserRegister, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="A user with this email already exists.")

    if payload.role not in ("admin", "manager", "employee", "client"):
        raise HTTPException(status_code=400, detail="Role must be admin, manager, employee, or client.")

    user = models.User(
        organization_id=payload.organization_id,
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=payload.role,
        designation=payload.designation,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    print(f"USER CREATED: {user.email} ({user.role})")
    return user


@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # OAuth2PasswordRequestForm sends "username" — we treat that field as email.
    print("\n========== LOGIN DEBUG ==========")
    print("EMAIL ENTERED:", form_data.username)

    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user:
        print("USER FOUND: NO")
        print("================================")
        raise HTTPException(status_code=401, detail="Incorrect email or password.")

    print("USER FOUND: YES")
    print("DB EMAIL:", user.email)
    print("ROLE:", user.role)
    try:
        print("HASH PREFIX:", user.password_hash[:20])
    except Exception:
        print("HASH PREFIX: unavailable")

    password_match = verify_password(form_data.password, user.password_hash)
    print("PASSWORD MATCH:", password_match)
    if not password_match:
        print("================================")
        raise HTTPException(status_code=401, detail="Incorrect email or password.")

    if hasattr(user, "is_active") and not user.is_active:
        print("ACCOUNT DEACTIVATED")
        print("================================")
        raise HTTPException(status_code=403, detail="This account has been deactivated.")

    access_token = create_access_token({
        "sub": str(user.id),
        "role": user.role,
        "organization_id": str(user.organization_id),
    })

    print("LOGIN SUCCESS")
    print("================================\n")
    return {"access_token": access_token, "token_type": "bearer", "user": user}
