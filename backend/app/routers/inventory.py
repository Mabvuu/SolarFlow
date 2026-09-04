from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import InventoryItem
from app.schemas import (
    InventoryCreate,
    InventoryUpdate,
    InventoryQuantityUpdate,
    InventoryRead,
)


router = APIRouter(
    prefix="/inventory",
    tags=["Inventory"],
)


@router.get("/", response_model=list[InventoryRead])
def get_inventory(
    db: Session = Depends(get_db),
):
    return (
        db.query(InventoryItem)
        .order_by(InventoryItem.id.desc())
        .all()
    )


@router.get("/low-stock", response_model=list[InventoryRead])
def get_low_stock(
    db: Session = Depends(get_db),
):
    return (
        db.query(InventoryItem)
        .filter(
            InventoryItem.quantity
            <= InventoryItem.reorder_level
        )
        .order_by(InventoryItem.quantity.asc())
        .all()
    )


@router.get("/{item_id}", response_model=InventoryRead)
def get_inventory_item(
    item_id: int,
    db: Session = Depends(get_db),
):
    item = (
        db.query(InventoryItem)
        .filter(InventoryItem.id == item_id)
        .first()
    )

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Inventory item not found",
        )

    return item


@router.post("/", response_model=InventoryRead)
def create_inventory_item(
    data: InventoryCreate,
    db: Session = Depends(get_db),
):
    item = InventoryItem(
        name=data.name,
        sku=data.sku,
        category=data.category,
        quantity=data.quantity,
        reorder_level=data.reorder_level,
        unit_cost=data.unit_cost,
        selling_price=data.selling_price,
    )

    db.add(item)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=400,
            detail="An inventory item with that SKU already exists.",
        )

    db.refresh(item)

    return item


@router.patch("/{item_id}", response_model=InventoryRead)
def update_inventory_item(
    item_id: int,
    data: InventoryUpdate,
    db: Session = Depends(get_db),
):
    item = (
        db.query(InventoryItem)
        .filter(InventoryItem.id == item_id)
        .first()
    )

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Inventory item not found",
        )

    values = data.model_dump(
        exclude_unset=True
    )

    for field, value in values.items():
        setattr(item, field, value)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=400,
            detail="An inventory item with that SKU already exists.",
        )

    db.refresh(item)

    return item


@router.patch("/{item_id}/quantity", response_model=InventoryRead)
def update_inventory_quantity(
    item_id: int,
    data: InventoryQuantityUpdate,
    db: Session = Depends(get_db),
):
    item = (
        db.query(InventoryItem)
        .filter(InventoryItem.id == item_id)
        .first()
    )

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Inventory item not found",
        )

    if data.quantity < 0:
        raise HTTPException(
            status_code=400,
            detail="Quantity cannot be negative",
        )

    item.quantity = data.quantity

    db.commit()
    db.refresh(item)

    return item


@router.delete("/{item_id}")
def delete_inventory_item(
    item_id: int,
    db: Session = Depends(get_db),
):
    item = (
        db.query(InventoryItem)
        .filter(InventoryItem.id == item_id)
        .first()
    )

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Inventory item not found",
        )

    db.delete(item)
    db.commit()

    return {
        "message": "Inventory item deleted"
    }