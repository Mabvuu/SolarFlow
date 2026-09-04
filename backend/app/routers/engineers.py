from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Engineer
from app.schemas import (
    EngineerCreate,
    EngineerUpdate,
    EngineerRead,
)


router = APIRouter(
    prefix="/engineers",
    tags=["Engineers"],
)


@router.get("/", response_model=list[EngineerRead])
def get_engineers(
    db: Session = Depends(get_db),
):
    return (
        db.query(Engineer)
        .order_by(Engineer.id.desc())
        .all()
    )


@router.get("/{engineer_id}", response_model=EngineerRead)
def get_engineer(
    engineer_id: int,
    db: Session = Depends(get_db),
):
    engineer = (
        db.query(Engineer)
        .filter(Engineer.id == engineer_id)
        .first()
    )

    if not engineer:
        raise HTTPException(
            status_code=404,
            detail="Engineer not found",
        )

    return engineer


@router.post("/", response_model=EngineerRead)
def create_engineer(
    data: EngineerCreate,
    db: Session = Depends(get_db),
):
    engineer = Engineer(
        name=data.name,
        email=data.email,
        phone=data.phone,
        specialization=data.specialization,
        status=data.status,
    )

    db.add(engineer)
    db.commit()
    db.refresh(engineer)

    return engineer


@router.patch("/{engineer_id}", response_model=EngineerRead)
def update_engineer(
    engineer_id: int,
    data: EngineerUpdate,
    db: Session = Depends(get_db),
):
    engineer = (
        db.query(Engineer)
        .filter(Engineer.id == engineer_id)
        .first()
    )

    if not engineer:
        raise HTTPException(
            status_code=404,
            detail="Engineer not found",
        )

    values = data.model_dump(
        exclude_unset=True
    )

    for field, value in values.items():
        setattr(engineer, field, value)

    db.commit()
    db.refresh(engineer)

    return engineer


@router.delete("/{engineer_id}")
def delete_engineer(
    engineer_id: int,
    db: Session = Depends(get_db),
):
    engineer = (
        db.query(Engineer)
        .filter(Engineer.id == engineer_id)
        .first()
    )

    if not engineer:
        raise HTTPException(
            status_code=404,
            detail="Engineer not found",
        )

    engineer.is_active = False
    engineer.status = "Inactive"

    db.commit()

    return {
        "message": "Engineer deactivated"
    }