import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Invoice, Customer
from app.schemas import (
    InvoiceCreate,
    InvoicePaymentUpdate,
    InvoiceStatusUpdate,
)


router = APIRouter(
    prefix="/invoices",
    tags=["Invoices"],
)


def serialize_invoice(invoice: Invoice):
    balance = max(
        invoice.amount - invoice.amount_paid,
        0
    )

    return {
        "id": invoice.id,
        "invoice_number": invoice.invoice_number,
        "amount": invoice.amount,
        "amount_paid": invoice.amount_paid,
        "balance": balance,
        "status": invoice.status,
        "created_at": invoice.created_at,

        "customer": {
            "id": invoice.customer.id,
            "name": invoice.customer.name,
            "phone": invoice.customer.phone,
            "email": invoice.customer.email,
        } if invoice.customer else None,
    }


@router.get("/")
def get_invoices(
    db: Session = Depends(get_db),
):
    invoices = (
        db.query(Invoice)
        .options(
            joinedload(Invoice.customer)
        )
        .order_by(Invoice.id.desc())
        .all()
    )

    return [
        serialize_invoice(invoice)
        for invoice in invoices
    ]


@router.get("/{invoice_id}")
def get_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
):
    invoice = (
        db.query(Invoice)
        .options(
            joinedload(Invoice.customer)
        )
        .filter(Invoice.id == invoice_id)
        .first()
    )

    if not invoice:
        raise HTTPException(
            status_code=404,
            detail="Invoice not found",
        )

    return serialize_invoice(invoice)


@router.post("/")
def create_invoice(
    data: InvoiceCreate,
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

    if data.amount < 0:
        raise HTTPException(
            status_code=400,
            detail="Invoice amount cannot be negative",
        )

    if data.amount_paid < 0:
        raise HTTPException(
            status_code=400,
            detail="Amount paid cannot be negative",
        )

    amount_paid = min(
        data.amount_paid,
        data.amount
    )

    if amount_paid >= data.amount and data.amount > 0:
        status = "Paid"
    elif amount_paid > 0:
        status = "Partially Paid"
    else:
        status = data.status

    invoice_number = (
        "INV-"
        + uuid.uuid4().hex[:8].upper()
    )

    invoice = Invoice(
        customer_id=data.customer_id,
        invoice_number=invoice_number,
        amount=data.amount,
        amount_paid=amount_paid,
        status=status,
    )

    db.add(invoice)
    db.commit()
    db.refresh(invoice)

    return {
        "message": "Invoice created",
        "id": invoice.id,
        "invoice_number": invoice.invoice_number,
    }


@router.patch("/{invoice_id}/payment")
def update_invoice_payment(
    invoice_id: int,
    data: InvoicePaymentUpdate,
    db: Session = Depends(get_db),
):
    invoice = (
        db.query(Invoice)
        .options(
            joinedload(Invoice.customer)
        )
        .filter(Invoice.id == invoice_id)
        .first()
    )

    if not invoice:
        raise HTTPException(
            status_code=404,
            detail="Invoice not found",
        )

    if data.amount_paid < 0:
        raise HTTPException(
            status_code=400,
            detail="Amount paid cannot be negative",
        )

    invoice.amount_paid = min(
        data.amount_paid,
        invoice.amount
    )

    if invoice.amount_paid >= invoice.amount:
        invoice.status = "Paid"

    elif invoice.amount_paid > 0:
        invoice.status = "Partially Paid"

    else:
        invoice.status = "Unpaid"

    db.commit()
    db.refresh(invoice)

    return serialize_invoice(invoice)


@router.patch("/{invoice_id}/status")
def update_invoice_status(
    invoice_id: int,
    data: InvoiceStatusUpdate,
    db: Session = Depends(get_db),
):
    invoice = (
        db.query(Invoice)
        .options(
            joinedload(Invoice.customer)
        )
        .filter(Invoice.id == invoice_id)
        .first()
    )

    if not invoice:
        raise HTTPException(
            status_code=404,
            detail="Invoice not found",
        )

    invoice.status = data.status

    if data.status == "Paid":
        invoice.amount_paid = invoice.amount

    db.commit()
    db.refresh(invoice)

    return serialize_invoice(invoice)


@router.delete("/{invoice_id}")
def delete_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
):
    invoice = (
        db.query(Invoice)
        .filter(Invoice.id == invoice_id)
        .first()
    )

    if not invoice:
        raise HTTPException(
            status_code=404,
            detail="Invoice not found",
        )

    db.delete(invoice)
    db.commit()

    return {
        "message": "Invoice deleted"
    }