from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Customer
from app.schemas import (
    CustomerCreate,
    CustomerUpdate,
    CustomerRead,
)


router = APIRouter(
    prefix="/customers",
    tags=["Customers"],
)


@router.get("/", response_model=list[CustomerRead])
def get_customers(
    db: Session = Depends(get_db),
):
    return (
        db.query(Customer)
        .order_by(Customer.id.desc())
        .all()
    )


@router.get("/{customer_id}", response_model=CustomerRead)
def get_customer(
    customer_id: int,
    db: Session = Depends(get_db),
):
    customer = (
        db.query(Customer)
        .filter(Customer.id == customer_id)
        .first()
    )

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found",
        )

    return customer


@router.post("/", response_model=CustomerRead)
def create_customer(
    data: CustomerCreate,
    db: Session = Depends(get_db),
):
    customer = Customer(
        name=data.name,
        email=data.email,
        phone=data.phone,
        address=data.address,
        customer_type=data.customer_type,
    )

    db.add(customer)
    db.commit()
    db.refresh(customer)

    return customer


@router.patch("/{customer_id}", response_model=CustomerRead)
def update_customer(
    customer_id: int,
    data: CustomerUpdate,
    db: Session = Depends(get_db),
):
    customer = (
        db.query(Customer)
        .filter(Customer.id == customer_id)
        .first()
    )

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found",
        )

    values = data.model_dump(
        exclude_unset=True
    )

    for field, value in values.items():
        setattr(customer, field, value)

    db.commit()
    db.refresh(customer)

    return customer


@router.delete("/{customer_id}")
def delete_customer(
    customer_id: int,
    db: Session = Depends(get_db),
):
    customer = (
        db.query(Customer)
        .filter(Customer.id == customer_id)
        .first()
    )

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found",
        )

    db.delete(customer)
    db.commit()

    return {
        "message": "Customer deleted"
    }