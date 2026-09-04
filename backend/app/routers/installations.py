from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import (
    Installation,
    Customer,
    Engineer,
)
from app.schemas import (
    InstallationCreate,
    InstallationStatusUpdate,
)


router = APIRouter(
    prefix="/installations",
    tags=["Installations"],
)


def serialize_installation(
    installation: Installation
):
    return {
        "id": installation.id,
        "system_size": installation.system_size,
        "inverter": installation.inverter,
        "battery": installation.battery,
        "panels": installation.panels,
        "installation_address": (
            installation.installation_address
        ),
        "status": installation.status,
        "scheduled_date": installation.scheduled_date,
        "completed_at": installation.completed_at,
        "created_at": installation.created_at,

        "customer": {
            "id": installation.customer.id,
            "name": installation.customer.name,
            "phone": installation.customer.phone,
            "email": installation.customer.email,
        } if installation.customer else None,

        "engineer": {
            "id": installation.engineer.id,
            "name": installation.engineer.name,
            "phone": installation.engineer.phone,
            "specialization": (
                installation.engineer.specialization
            ),
        } if installation.engineer else None,
    }


@router.get("/")
def get_installations(
    db: Session = Depends(get_db),
):
    installations = (
        db.query(Installation)
        .options(
            joinedload(Installation.customer),
            joinedload(Installation.engineer),
        )
        .order_by(Installation.id.desc())
        .all()
    )

    return [
        serialize_installation(item)
        for item in installations
    ]


@router.get("/{installation_id}")
def get_installation(
    installation_id: int,
    db: Session = Depends(get_db),
):
    installation = (
        db.query(Installation)
        .options(
            joinedload(Installation.customer),
            joinedload(Installation.engineer),
        )
        .filter(
            Installation.id == installation_id
        )
        .first()
    )

    if not installation:
        raise HTTPException(
            status_code=404,
            detail="Installation not found",
        )

    return serialize_installation(
        installation
    )


@router.post("/")
def create_installation(
    data: InstallationCreate,
    db: Session = Depends(get_db),
):
    customer = (
        db.query(Customer)
        .filter(
            Customer.id == data.customer_id
        )
        .first()
    )

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found",
        )

    if data.engineer_id:
        engineer = (
            db.query(Engineer)
            .filter(
                Engineer.id == data.engineer_id
            )
            .first()
        )

        if not engineer:
            raise HTTPException(
                status_code=404,
                detail="Engineer not found",
            )

    installation = Installation(
        customer_id=data.customer_id,
        engineer_id=data.engineer_id,
        system_size=data.system_size,
        inverter=data.inverter,
        battery=data.battery,
        panels=data.panels,
        installation_address=(
            data.installation_address
        ),
        status=data.status,
        scheduled_date=data.scheduled_date,
    )

    db.add(installation)
    db.commit()
    db.refresh(installation)

    return {
        "message": "Installation created",
        "id": installation.id,
    }


@router.patch("/{installation_id}/status")
def update_installation_status(
    installation_id: int,
    data: InstallationStatusUpdate,
    db: Session = Depends(get_db),
):
    installation = (
        db.query(Installation)
        .filter(
            Installation.id == installation_id
        )
        .first()
    )

    if not installation:
        raise HTTPException(
            status_code=404,
            detail="Installation not found",
        )

    installation.status = data.status

    if data.status == "Completed":
        installation.completed_at = (
            datetime.utcnow()
        )

    db.commit()

    return {
        "message": "Installation updated",
        "status": installation.status,
    }


@router.delete("/{installation_id}")
def delete_installation(
    installation_id: int,
    db: Session = Depends(get_db),
):
    installation = (
        db.query(Installation)
        .filter(
            Installation.id == installation_id
        )
        .first()
    )

    if not installation:
        raise HTTPException(
            status_code=404,
            detail="Installation not found",
        )

    db.delete(installation)
    db.commit()

    return {
        "message": "Installation deleted"
    }