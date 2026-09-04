from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Supplier
from app.schemas import (
    SupplierCreate,
    SupplierUpdate,
    SupplierRead,
)


router = APIRouter(
    prefix="/suppliers",
    tags=["Suppliers"],
)


@router.get("/", response_model=list[SupplierRead])
def get_suppliers(
    db: Session = Depends(get_db),
):
    return (
        db.query(Supplier)
        .order_by(Supplier.id.desc())
        .all()
    )


@router.get("/{supplier_id}", response_model=SupplierRead)
def get_supplier(
    supplier_id: int,
    db: Session = Depends(get_db),
):
    supplier = (
        db.query(Supplier)
        .filter(Supplier.id == supplier_id)
        .first()
    )

    if not supplier:
        raise HTTPException(
            status_code=404,
            detail="Supplier not found",
        )

    return supplier


@router.post("/", response_model=SupplierRead)
def create_supplier(
    data: SupplierCreate,
    db: Session = Depends(get_db),
):
    supplier = Supplier(
        name=data.name,
        contact_person=data.contact_person,
        phone=data.phone,
        email=data.email,
    )

    db.add(supplier)
    db.commit()
    db.refresh(supplier)

    return supplier


@router.patch("/{supplier_id}", response_model=SupplierRead)
def update_supplier(
    supplier_id: int,
    data: SupplierUpdate,
    db: Session = Depends(get_db),
):
    supplier = (
        db.query(Supplier)
        .filter(Supplier.id == supplier_id)
        .first()
    )

    if not supplier:
        raise HTTPException(
            status_code=404,
            detail="Supplier not found",
        )

    values = data.model_dump(
        exclude_unset=True
    )

    for field, value in values.items():
        setattr(supplier, field, value)

    db.commit()
    db.refresh(supplier)

    return supplier


@router.delete("/{supplier_id}")
def delete_supplier(
    supplier_id: int,
    db: Session = Depends(get_db),
):
    supplier = (
        db.query(Supplier)
        .filter(Supplier.id == supplier_id)
        .first()
    )

    if not supplier:
        raise HTTPException(
            status_code=404,
            detail="Supplier not found",
        )

    db.delete(supplier)
    db.commit()

    return {
        "message": "Supplier deleted"
    }