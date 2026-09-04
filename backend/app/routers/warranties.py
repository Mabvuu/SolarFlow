from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import (
    Warranty,
    Customer,
    Installation,
)
from app.schemas import (
    WarrantyCreate,
    WarrantyStatusUpdate,
)


router = APIRouter(
    prefix="/warranties",
    tags=["Warranties"],
)


def serialize_warranty(
    warranty: Warranty,
    db: Session,
):
    customer = (
        db.query(Customer)
        .filter(
            Customer.id == warranty.customer_id
        )
        .first()
    )

    installation = None

    if warranty.installation_id:
        installation = (
            db.query(Installation)
            .filter(
                Installation.id
                == warranty.installation_id
            )
            .first()
        )

    return {
        "id": warranty.id,
        "item_name": warranty.item_name,
        "serial_number": warranty.serial_number,
        "status": warranty.status,
        "created_at": warranty.created_at,

        "customer": {
            "id": customer.id,
            "name": customer.name,
            "phone": customer.phone,
            "email": customer.email,
        } if customer else None,

        "installation": {
            "id": installation.id,
            "system_size": installation.system_size,
            "status": installation.status,
        } if installation else None,
    }


@router.get("/")
def get_warranties(
    db: Session = Depends(get_db),
):
    warranties = (
        db.query(Warranty)
        .order_by(Warranty.id.desc())
        .all()
    )

    return [
        serialize_warranty(
            warranty,
            db
        )
        for warranty in warranties
    ]


@router.get("/{warranty_id}")
def get_warranty(
    warranty_id: int,
    db: Session = Depends(get_db),
):
    warranty = (
        db.query(Warranty)
        .filter(
            Warranty.id == warranty_id
        )
        .first()
    )

    if not warranty:
        raise HTTPException(
            status_code=404,
            detail="Warranty not found",
        )

    return serialize_warranty(
        warranty,
        db
    )


@router.post("/")
def create_warranty(
    data: WarrantyCreate,
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

    if data.installation_id:
        installation = (
            db.query(Installation)
            .filter(
                Installation.id
                == data.installation_id
            )
            .first()
        )

        if not installation:
            raise HTTPException(
                status_code=404,
                detail="Installation not found",
            )

    warranty = Warranty(
        customer_id=data.customer_id,
        installation_id=data.installation_id,
        item_name=data.item_name,
        serial_number=data.serial_number,
        status=data.status,
    )

    db.add(warranty)
    db.commit()
    db.refresh(warranty)

    return {
        "message": "Warranty created",
        "id": warranty.id,
    }


@router.patch("/{warranty_id}/status")
def update_warranty_status(
    warranty_id: int,
    data: WarrantyStatusUpdate,
    db: Session = Depends(get_db),
):
    warranty = (
        db.query(Warranty)
        .filter(
            Warranty.id == warranty_id
        )
        .first()
    )

    if not warranty:
        raise HTTPException(
            status_code=404,
            detail="Warranty not found",
        )

    warranty.status = data.status

    db.commit()

    return {
        "message": "Warranty updated",
        "status": warranty.status,
    }


@router.delete("/{warranty_id}")
def delete_warranty(
    warranty_id: int,
    db: Session = Depends(get_db),
):
    warranty = (
        db.query(Warranty)
        .filter(
            Warranty.id == warranty_id
        )
        .first()
    )

    if not warranty:
        raise HTTPException(
            status_code=404,
            detail="Warranty not found",
        )

    db.delete(warranty)
    db.commit()

    return {
        "message": "Warranty deleted"
    }