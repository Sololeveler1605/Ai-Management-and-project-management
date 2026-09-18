from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from dependencies import require_role
import models
import schemas
from security import hash_password

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=list[schemas.UserOut])
def list_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role(["admin", "manager"])),
):
    return (
        db.query(models.User)
        .filter(models.User.organization_id == current_user.organization_id)
        .all()
    )


@router.patch("/{user_id}", response_model=schemas.UserOut)
def update_user(user_id: str, payload: schemas.UserUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(require_role(["admin", "manager"]))):
    user = db.query(models.User).filter(models.User.id == user_id, models.User.organization_id == current_user.organization_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Employee not found")
    if user.role != "employee":
        raise HTTPException(status_code=400, detail="Only employee accounts can be managed here")
    values = payload.model_dump(exclude_unset=True)
    if "password" in values:
        password = values.pop("password")
        if password:
            user.password_hash = hash_password(password)
    if "email" in values and values["email"] != user.email and db.query(models.User).filter(models.User.email == values["email"]).first():
        raise HTTPException(status_code=400, detail="This email is already in use")
    for field, value in values.items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(require_role(["admin", "manager"]))):
    user = db.query(models.User).filter(models.User.id == user_id, models.User.organization_id == current_user.organization_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Employee not found")
    if user.role != "employee":
        raise HTTPException(status_code=400, detail="Only employee accounts can be deleted here")
    db.delete(user)
    db.commit()
