import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import (
    ServiceJob,
    JobUpdate,
    Customer,
    Engineer
)
from app.schemas import (
    ServiceJobCreate,
    ServiceJobStatusUpdate
)


router = APIRouter(
    prefix="/jobs",
    tags=["Service Jobs"]
)


def serialize_job(job: ServiceJob):
    return {
        "id": job.id,
        "tracking_code": job.tracking_code,

        "job_type": job.job_type,
        "title": job.title,
        "description": job.description,
        "address": job.address,

        "priority": job.priority,
        "status": job.status,

        "eta": job.eta,

        "fault_confirmed_fixed": job.fault_confirmed_fixed,
        "customer_confirmed": job.customer_confirmed,

        "created_at": job.created_at,
        "completed_at": job.completed_at,

        "customer": {
            "id": job.customer.id,
            "name": job.customer.name,
            "phone": job.customer.phone,
            "email": job.customer.email,
            "address": job.customer.address
        } if job.customer else None,

        "engineer": {
            "id": job.engineer.id,
            "name": job.engineer.name,
            "phone": job.engineer.phone,
            "email": job.engineer.email,
            "specialization": job.engineer.specialization,
            "status": job.engineer.status
        } if job.engineer else None,

        "updates": [
            {
                "id": update.id,
                "status": update.status,
                "note": update.note,
                "created_at": update.created_at
            }
            for update in sorted(
                job.updates,
                key=lambda item: item.created_at
            )
        ]
    }


@router.get("/")
def get_jobs(
    db: Session = Depends(get_db)
):
    jobs = (
        db.query(ServiceJob)
        .options(
            joinedload(ServiceJob.customer),
            joinedload(ServiceJob.engineer),
            joinedload(ServiceJob.updates)
        )
        .order_by(ServiceJob.id.desc())
        .all()
    )

    return [
        serialize_job(job)
        for job in jobs
    ]


@router.get("/tracking/{tracking_code}")
def track_job(
    tracking_code: str,
    db: Session = Depends(get_db)
):
    job = (
        db.query(ServiceJob)
        .options(
            joinedload(ServiceJob.customer),
            joinedload(ServiceJob.engineer),
            joinedload(ServiceJob.updates)
        )
        .filter(
            ServiceJob.tracking_code == tracking_code
        )
        .first()
    )

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Tracking code not found"
        )

    return serialize_job(job)


@router.get("/{job_id}")
def get_job(
    job_id: int,
    db: Session = Depends(get_db)
):
    job = (
        db.query(ServiceJob)
        .options(
            joinedload(ServiceJob.customer),
            joinedload(ServiceJob.engineer),
            joinedload(ServiceJob.updates)
        )
        .filter(ServiceJob.id == job_id)
        .first()
    )

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    return serialize_job(job)


@router.post("/")
def create_job(
    data: ServiceJobCreate,
    db: Session = Depends(get_db)
):
    customer = (
        db.query(Customer)
        .filter(Customer.id == data.customer_id)
        .first()
    )

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )

    engineer = None

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
                detail="Engineer not found"
            )

    tracking_code = (
        "SOL-" +
        uuid.uuid4().hex[:8].upper()
    )

    job = ServiceJob(
        tracking_code=tracking_code,
        customer_id=data.customer_id,
        engineer_id=data.engineer_id,
        job_type=data.job_type,
        title=data.title,
        description=data.description,
        address=data.address,
        priority=data.priority,
        eta=data.eta,
        status="Request Received"
    )

    db.add(job)
    db.commit()
    db.refresh(job)

    first_update = JobUpdate(
        job_id=job.id,
        status="Request Received",
        note="Service request received."
    )

    db.add(first_update)

    if engineer:
        engineer.status = "Assigned"

    db.commit()

    return {
        "message": "Service job created",
        "id": job.id,
        "tracking_code": tracking_code
    }


@router.patch("/{job_id}/status")
def update_job_status(
    job_id: int,
    data: ServiceJobStatusUpdate,
    db: Session = Depends(get_db)
):
    job = (
        db.query(ServiceJob)
        .filter(ServiceJob.id == job_id)
        .first()
    )

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    job.status = data.status

    if data.eta:
        job.eta = data.eta

    if data.status == "Completed":
        job.completed_at = datetime.utcnow()

        if job.engineer:
            job.engineer.status = "Available"

    update = JobUpdate(
        job_id=job.id,
        status=data.status,
        note=data.note
    )

    db.add(update)
    db.commit()
    db.refresh(job)

    return {
        "message": "Job status updated",
        "status": job.status,
        "eta": job.eta
    }


@router.patch("/{job_id}/confirm-fixed")
def confirm_fault_fixed(
    job_id: int,
    db: Session = Depends(get_db)
):
    job = (
        db.query(ServiceJob)
        .filter(ServiceJob.id == job_id)
        .first()
    )

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    job.fault_confirmed_fixed = True

    update = JobUpdate(
        job_id=job.id,
        status="Work Completed",
        note="Engineer confirmed work has been completed."
    )

    db.add(update)
    db.commit()

    return {
        "message": "Work confirmed complete"
    }


@router.patch("/{job_id}/customer-confirm")
def customer_confirm(
    job_id: int,
    db: Session = Depends(get_db)
):
    job = (
        db.query(ServiceJob)
        .filter(ServiceJob.id == job_id)
        .first()
    )

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    job.customer_confirmed = True
    job.status = "Completed"
    job.completed_at = datetime.utcnow()

    if job.engineer:
        job.engineer.status = "Available"

    update = JobUpdate(
        job_id=job.id,
        status="Completed",
        note="Customer confirmed the service was completed successfully."
    )

    db.add(update)
    db.commit()

    return {
        "message": "Customer confirmation received",
        "status": "Completed"
    }