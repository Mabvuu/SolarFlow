from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Lead
from app.schemas import (
    LeadCreate,
    LeadUpdate,
    LeadRead,
)


router = APIRouter(
    prefix="/leads",
    tags=["Leads"],
)


@router.get("/", response_model=list[LeadRead])
def get_leads(
    db: Session = Depends(get_db),
):
    return (
        db.query(Lead)
        .order_by(Lead.id.desc())
        .all()
    )


@router.get("/{lead_id}", response_model=LeadRead)
def get_lead(
    lead_id: int,
    db: Session = Depends(get_db),
):
    lead = (
        db.query(Lead)
        .filter(Lead.id == lead_id)
        .first()
    )

    if not lead:
        raise HTTPException(
            status_code=404,
            detail="Lead not found",
        )

    return lead


@router.post("/", response_model=LeadRead)
def create_lead(
    data: LeadCreate,
    db: Session = Depends(get_db),
):
    lead = Lead(
        name=data.name,
        phone=data.phone,
        email=data.email,
        source=data.source,
        status=data.status,
        notes=data.notes,
        estimated_value=data.estimated_value,
    )

    db.add(lead)
    db.commit()
    db.refresh(lead)

    return lead


@router.patch("/{lead_id}", response_model=LeadRead)
def update_lead(
    lead_id: int,
    data: LeadUpdate,
    db: Session = Depends(get_db),
):
    lead = (
        db.query(Lead)
        .filter(Lead.id == lead_id)
        .first()
    )

    if not lead:
        raise HTTPException(
            status_code=404,
            detail="Lead not found",
        )

    values = data.model_dump(
        exclude_unset=True
    )

    for field, value in values.items():
        setattr(lead, field, value)

    db.commit()
    db.refresh(lead)

    return lead


@router.delete("/{lead_id}")
def delete_lead(
    lead_id: int,
    db: Session = Depends(get_db),
):
    lead = (
        db.query(Lead)
        .filter(Lead.id == lead_id)
        .first()
    )

    if not lead:
        raise HTTPException(
            status_code=404,
            detail="Lead not found",
        )

    db.delete(lead)
    db.commit()

    return {
        "message": "Lead deleted"
    }