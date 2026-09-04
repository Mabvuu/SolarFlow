import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Quote, Customer
from app.schemas import (
    QuoteCreate,
    QuoteStatusUpdate,
)


router = APIRouter(
    prefix="/quotes",
    tags=["Quotes"],
)


def serialize_quote(quote: Quote):
    return {
        "id": quote.id,
        "quote_number": quote.quote_number,
        "description": quote.description,
        "total": quote.total,
        "status": quote.status,
        "created_at": quote.created_at,
        "customer": {
            "id": quote.customer.id,
            "name": quote.customer.name,
            "email": quote.customer.email,
            "phone": quote.customer.phone,
        } if quote.customer else None,
    }


@router.get("/")
def get_quotes(
    db: Session = Depends(get_db),
):
    quotes = (
        db.query(Quote)
        .options(
            joinedload(Quote.customer)
        )
        .order_by(Quote.id.desc())
        .all()
    )

    return [
        serialize_quote(quote)
        for quote in quotes
    ]


@router.get("/{quote_id}")
def get_quote(
    quote_id: int,
    db: Session = Depends(get_db),
):
    quote = (
        db.query(Quote)
        .options(
            joinedload(Quote.customer)
        )
        .filter(Quote.id == quote_id)
        .first()
    )

    if not quote:
        raise HTTPException(
            status_code=404,
            detail="Quote not found",
        )

    return serialize_quote(quote)


@router.post("/")
def create_quote(
    data: QuoteCreate,
    db: Session = Depends(get_db),
):
    customer = (
        db.query(Customer)
        .filter(Customer.id == data.customer_id)
        .first()
    )

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found",
        )

    quote_number = (
        "QUO-"
        + uuid.uuid4().hex[:8].upper()
    )

    quote = Quote(
        customer_id=data.customer_id,
        quote_number=quote_number,
        description=data.description,
        total=data.total,
        status=data.status,
    )

    db.add(quote)
    db.commit()
    db.refresh(quote)

    return {
        "message": "Quote created",
        "id": quote.id,
        "quote_number": quote.quote_number,
    }


@router.patch("/{quote_id}/status")
def update_quote_status(
    quote_id: int,
    data: QuoteStatusUpdate,
    db: Session = Depends(get_db),
):
    quote = (
        db.query(Quote)
        .filter(Quote.id == quote_id)
        .first()
    )

    if not quote:
        raise HTTPException(
            status_code=404,
            detail="Quote not found",
        )

    quote.status = data.status

    db.commit()
    db.refresh(quote)

    return serialize_quote(quote)


@router.delete("/{quote_id}")
def delete_quote(
    quote_id: int,
    db: Session = Depends(get_db),
):
    quote = (
        db.query(Quote)
        .filter(Quote.id == quote_id)
        .first()
    )

    if not quote:
        raise HTTPException(
            status_code=404,
            detail="Quote not found",
        )

    db.delete(quote)
    db.commit()

    return {
        "message": "Quote deleted"
    }