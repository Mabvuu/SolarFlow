import base64
import hashlib
import hmac
import os
import uuid

from datetime import datetime
from typing import Optional

from fastapi import (
    APIRouter,
    Depends,
    Header,
    HTTPException,
)

from pydantic import BaseModel
from sqlalchemy.orm import Session, joinedload

from app.database import get_db

from app.models import (
    Customer,
    Engineer,
    Installation,
    Invoice,
    JobUpdate,
    ServiceJob,
    Warranty,
)


router = APIRouter(
    prefix="/customer-portal",
    tags=["Customer Portal"],
)


# =========================================================
# DEMO AUTH
# =========================================================

CUSTOMER_PORTAL_SECRET = os.getenv(
    "CUSTOMER_PORTAL_SECRET",
    "solarflow-customer-demo-secret-2026",
)

DEMO_PASSWORD = "customer123"


class CustomerLogin(BaseModel):
    email: str
    password: str


class CustomerServiceRequest(BaseModel):
    job_type: str = "Fault"
    title: str
    description: Optional[str] = None
    address: Optional[str] = None
    priority: str = "Normal"


def create_token(
    customer_id: int,
):
    payload = str(customer_id)

    signature = hmac.new(
        CUSTOMER_PORTAL_SECRET.encode(),
        payload.encode(),
        hashlib.sha256,
    ).digest()

    encoded_signature = (
        base64.urlsafe_b64encode(
            signature
        )
        .decode()
        .rstrip("=")
    )

    return (
        f"{payload}.{encoded_signature}"
    )


def verify_token(
    token: str,
):
    try:
        customer_id_text, signature = (
            token.split(".", 1)
        )

        expected = create_token(
            int(customer_id_text)
        )

        if not hmac.compare_digest(
            token,
            expected,
        ):
            return None

        return int(
            customer_id_text
        )

    except Exception:
        return None


def get_current_customer(
    authorization: Optional[str] = Header(
        default=None
    ),
    db: Session = Depends(get_db),
):
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated",
        )

    if not authorization.startswith(
        "Bearer "
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication",
        )

    token = authorization.replace(
        "Bearer ",
        "",
        1,
    ).strip()

    customer_id = verify_token(
        token
    )

    if not customer_id:
        raise HTTPException(
            status_code=401,
            detail="Invalid session",
        )

    customer = (
        db.query(Customer)
        .filter(
            Customer.id == customer_id
        )
        .first()
    )

    if not customer:
        raise HTTPException(
            status_code=401,
            detail="Customer not found",
        )

    return customer


# =========================================================
# SERIALIZERS
# =========================================================

def serialize_customer(
    customer: Customer,
):
    return {
        "id": customer.id,
        "name": customer.name,
        "email": customer.email,
        "phone": customer.phone,
        "address": customer.address,
        "customer_type": (
            customer.customer_type
        ),
        "created_at": customer.created_at,
    }


def serialize_job(
    job: ServiceJob,
):
    return {
        "id": job.id,
        "tracking_code": (
            job.tracking_code
        ),
        "job_type": job.job_type,
        "title": job.title,
        "description": (
            job.description
        ),
        "address": job.address,
        "priority": job.priority,
        "status": job.status,
        "eta": job.eta,
        "fault_confirmed_fixed": (
            job.fault_confirmed_fixed
        ),
        "customer_confirmed": (
            job.customer_confirmed
        ),
        "created_at": job.created_at,
        "completed_at": (
            job.completed_at
        ),

        "engineer": {
            "id": job.engineer.id,
            "name": job.engineer.name,
            "phone": job.engineer.phone,
            "email": job.engineer.email,
            "specialization": (
                job.engineer.specialization
            ),
        }
        if job.engineer
        else None,

        "updates": [
            {
                "id": update.id,
                "status": update.status,
                "note": update.note,
                "created_at": (
                    update.created_at
                ),
            }
            for update in sorted(
                job.updates,
                key=lambda item: (
                    item.created_at
                ),
            )
        ],
    }


def serialize_installation(
    installation: Installation,
):
    return {
        "id": installation.id,
        "system_size": (
            installation.system_size
        ),
        "inverter": (
            installation.inverter
        ),
        "battery": (
            installation.battery
        ),
        "panels": (
            installation.panels
        ),
        "installation_address": (
            installation.installation_address
        ),
        "status": (
            installation.status
        ),
        "scheduled_date": (
            installation.scheduled_date
        ),
        "completed_at": (
            installation.completed_at
        ),
        "created_at": (
            installation.created_at
        ),

        "engineer": {
            "id": installation.engineer.id,
            "name": (
                installation.engineer.name
            ),
            "phone": (
                installation.engineer.phone
            ),
            "specialization": (
                installation.engineer.specialization
            ),
        }
        if installation.engineer
        else None,
    }


def serialize_invoice(
    invoice: Invoice,
):
    balance = max(
        invoice.amount
        - invoice.amount_paid,
        0,
    )

    return {
        "id": invoice.id,
        "invoice_number": (
            invoice.invoice_number
        ),
        "amount": invoice.amount,
        "amount_paid": (
            invoice.amount_paid
        ),
        "balance": balance,
        "status": invoice.status,
        "created_at": (
            invoice.created_at
        ),
    }


def serialize_warranty(
    warranty: Warranty,
    db: Session,
):
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
        "item_name": (
            warranty.item_name
        ),
        "serial_number": (
            warranty.serial_number
        ),
        "status": warranty.status,
        "created_at": (
            warranty.created_at
        ),

        "installation": {
            "id": installation.id,
            "system_size": (
                installation.system_size
            ),
            "status": (
                installation.status
            ),
        }
        if installation
        else None,
    }


# =========================================================
# LOGIN
# =========================================================

@router.post("/login")
def customer_login(
    data: CustomerLogin,
    db: Session = Depends(get_db),
):
    customer = (
        db.query(Customer)
        .filter(
            Customer.email
            == data.email.strip()
        )
        .first()
    )

    if not customer:
        raise HTTPException(
            status_code=401,
            detail=(
                "Invalid email or password"
            ),
        )

    # DEMO ONLY.
    # Production would use hashed
    # customer passwords.
    if data.password != DEMO_PASSWORD:
        raise HTTPException(
            status_code=401,
            detail=(
                "Invalid email or password"
            ),
        )

    token = create_token(
        customer.id
    )

    return {
        "token": token,
        "customer": (
            serialize_customer(
                customer
            )
        ),
    }


# =========================================================
# PROFILE
# =========================================================

@router.get("/me")
def get_me(
    customer: Customer = Depends(
        get_current_customer
    ),
):
    return serialize_customer(
        customer
    )


# =========================================================
# DASHBOARD
# =========================================================

@router.get("/dashboard")
def customer_dashboard(
    customer: Customer = Depends(
        get_current_customer
    ),
    db: Session = Depends(get_db),
):
    installations = (
        db.query(Installation)
        .options(
            joinedload(
                Installation.engineer
            )
        )
        .filter(
            Installation.customer_id
            == customer.id
        )
        .order_by(
            Installation.id.desc()
        )
        .all()
    )

    jobs = (
        db.query(ServiceJob)
        .options(
            joinedload(
                ServiceJob.engineer
            ),
            joinedload(
                ServiceJob.updates
            ),
        )
        .filter(
            ServiceJob.customer_id
            == customer.id
        )
        .order_by(
            ServiceJob.id.desc()
        )
        .all()
    )

    invoices = (
        db.query(Invoice)
        .filter(
            Invoice.customer_id
            == customer.id
        )
        .order_by(
            Invoice.id.desc()
        )
        .all()
    )

    warranties = (
        db.query(Warranty)
        .filter(
            Warranty.customer_id
            == customer.id
        )
        .order_by(
            Warranty.id.desc()
        )
        .all()
    )

    active_jobs = [
        job
        for job in jobs
        if job.status != "Completed"
    ]

    active_installations = [
        installation
        for installation
        in installations
        if installation.status
        != "Completed"
    ]

    total_invoiced = sum(
        invoice.amount
        for invoice in invoices
    )

    total_paid = sum(
        invoice.amount_paid
        for invoice in invoices
    )

    outstanding = max(
        total_invoiced
        - total_paid,
        0,
    )

    return {
        "customer": (
            serialize_customer(
                customer
            )
        ),

        "summary": {
            "installations": len(
                installations
            ),
            "active_installations": len(
                active_installations
            ),
            "service_jobs": len(
                jobs
            ),
            "active_service_jobs": len(
                active_jobs
            ),
            "warranties": len(
                warranties
            ),
            "outstanding": (
                outstanding
            ),
        },

        "latest_installation": (
            serialize_installation(
                installations[0]
            )
            if installations
            else None
        ),

        "latest_service_job": (
            serialize_job(
                jobs[0]
            )
            if jobs
            else None
        ),

        "recent_invoices": [
            serialize_invoice(
                invoice
            )
            for invoice
            in invoices[:3]
        ],

        "warranties": [
            serialize_warranty(
                warranty,
                db,
            )
            for warranty
            in warranties[:4]
        ],
    }


# =========================================================
# SERVICE JOBS
# =========================================================

@router.get("/service-jobs")
def get_customer_service_jobs(
    customer: Customer = Depends(
        get_current_customer
    ),
    db: Session = Depends(get_db),
):
    jobs = (
        db.query(ServiceJob)
        .options(
            joinedload(
                ServiceJob.engineer
            ),
            joinedload(
                ServiceJob.updates
            ),
        )
        .filter(
            ServiceJob.customer_id
            == customer.id
        )
        .order_by(
            ServiceJob.id.desc()
        )
        .all()
    )

    return [
        serialize_job(job)
        for job in jobs
    ]


@router.post("/service-jobs")
def create_customer_service_job(
    data: CustomerServiceRequest,
    customer: Customer = Depends(
        get_current_customer
    ),
    db: Session = Depends(get_db),
):
    tracking_code = (
        "SOL-"
        + uuid.uuid4()
        .hex[:8]
        .upper()
    )

    job = ServiceJob(
        tracking_code=tracking_code,
        customer_id=customer.id,
        engineer_id=None,
        job_type=data.job_type,
        title=data.title,
        description=data.description,
        address=(
            data.address
            or customer.address
        ),
        priority=data.priority,
        status="Request Received",
    )

    db.add(job)
    db.commit()
    db.refresh(job)

    update = JobUpdate(
        job_id=job.id,
        status="Request Received",
        note=(
            "Service request submitted "
            "through customer portal."
        ),
    )

    db.add(update)
    db.commit()

    return {
        "message": (
            "Service request submitted"
        ),
        "id": job.id,
        "tracking_code": (
            job.tracking_code
        ),
    }


@router.patch(
    "/service-jobs/{job_id}/confirm"
)
def confirm_customer_job(
    job_id: int,
    customer: Customer = Depends(
        get_current_customer
    ),
    db: Session = Depends(get_db),
):
    job = (
        db.query(ServiceJob)
        .filter(
            ServiceJob.id == job_id,
            ServiceJob.customer_id
            == customer.id,
        )
        .first()
    )

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Service job not found",
        )

    if not job.fault_confirmed_fixed:
        raise HTTPException(
            status_code=400,
            detail=(
                "Engineer has not yet "
                "confirmed completion."
            ),
        )

    job.customer_confirmed = True
    job.status = "Completed"
    job.completed_at = (
        datetime.utcnow()
    )

    if job.engineer:
        job.engineer.status = (
            "Available"
        )

    update = JobUpdate(
        job_id=job.id,
        status="Completed",
        note=(
            "Customer confirmed the "
            "work was completed."
        ),
    )

    db.add(update)
    db.commit()

    return {
        "message": (
            "Service completion confirmed"
        )
    }


# =========================================================
# INSTALLATIONS
# =========================================================

@router.get("/installations")
def get_customer_installations(
    customer: Customer = Depends(
        get_current_customer
    ),
    db: Session = Depends(get_db),
):
    installations = (
        db.query(Installation)
        .options(
            joinedload(
                Installation.engineer
            )
        )
        .filter(
            Installation.customer_id
            == customer.id
        )
        .order_by(
            Installation.id.desc()
        )
        .all()
    )

    return [
        serialize_installation(
            installation
        )
        for installation
        in installations
    ]


# =========================================================
# INVOICES
# =========================================================

@router.get("/invoices")
def get_customer_invoices(
    customer: Customer = Depends(
        get_current_customer
    ),
    db: Session = Depends(get_db),
):
    invoices = (
        db.query(Invoice)
        .filter(
            Invoice.customer_id
            == customer.id
        )
        .order_by(
            Invoice.id.desc()
        )
        .all()
    )

    return [
        serialize_invoice(
            invoice
        )
        for invoice in invoices
    ]


# =========================================================
# WARRANTIES
# =========================================================

@router.get("/warranties")
def get_customer_warranties(
    customer: Customer = Depends(
        get_current_customer
    ),
    db: Session = Depends(get_db),
):
    warranties = (
        db.query(Warranty)
        .filter(
            Warranty.customer_id
            == customer.id
        )
        .order_by(
            Warranty.id.desc()
        )
        .all()
    )

    return [
        serialize_warranty(
            warranty,
            db,
        )
        for warranty
        in warranties
    ]