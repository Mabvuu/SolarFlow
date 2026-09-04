from fastapi import APIRouter, Depends

from sqlalchemy import (
    case,
    func,
)

from sqlalchemy.orm import (
    Session,
    joinedload,
)

from app.database import get_db

from app.models import (
    Customer,
    Engineer,
    Installation,
    InventoryItem,
    Invoice,
    Lead,
    Quote,
    ServiceJob,
    Warranty,
)


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


@router.get("/")
def get_dashboard(
    db: Session = Depends(get_db),
):
    total_customers = (
        db.query(Customer).count()
    )

    total_leads = (
        db.query(Lead).count()
    )

    total_quotes = (
        db.query(Quote).count()
    )

    active_installations = (
        db.query(Installation)
        .filter(
            Installation.status
            != "Completed"
        )
        .count()
    )

    completed_installations = (
        db.query(Installation)
        .filter(
            Installation.status
            == "Completed"
        )
        .count()
    )

    open_jobs = (
        db.query(ServiceJob)
        .filter(
            ServiceJob.status
            != "Completed"
        )
        .count()
    )

    urgent_jobs = (
        db.query(ServiceJob)
        .filter(
            ServiceJob.status
            != "Completed",
            ServiceJob.priority
            == "Urgent",
        )
        .count()
    )

    available_engineers = (
        db.query(Engineer)
        .filter(
            Engineer.status
            == "Available",
            Engineer.is_active
            == True,
        )
        .count()
    )

    low_stock = (
        db.query(InventoryItem)
        .filter(
            InventoryItem.quantity
            <=
            InventoryItem.reorder_level
        )
        .count()
    )

    total_invoiced = (
        db.query(
            func.coalesce(
                func.sum(
                    Invoice.amount
                ),
                0,
            )
        )
        .scalar()
    )

    total_received = (
        db.query(
            func.coalesce(
                func.sum(
                    Invoice.amount_paid
                ),
                0,
            )
        )
        .scalar()
    )

    outstanding = max(
        float(total_invoiced)
        - float(total_received),
        0,
    )

    active_warranties = (
        db.query(Warranty)
        .filter(
            Warranty.status
            == "Active"
        )
        .count()
    )

    # =====================================================
    # ACTIVE JOBS ONLY
    #
    # On Route is deliberately prioritised because
    # this is the most useful live customer tracking job.
    # =====================================================

    service_status_priority = case(
        (
            ServiceJob.status
            == "On Route",
            0,
        ),
        (
            ServiceJob.status
            == "Arrived",
            1,
        ),
        (
            ServiceJob.status
            == "Working",
            2,
        ),
        (
            ServiceJob.status
            == "Inspection",
            3,
        ),
        (
            ServiceJob.status
            == "Engineer Assigned",
            4,
        ),
        (
            ServiceJob.status
            == "Accepted",
            5,
        ),
        (
            ServiceJob.status
            == "Request Received",
            6,
        ),
        else_=7,
    )

    recent_jobs = (
        db.query(ServiceJob)
        .options(
            joinedload(
                ServiceJob.customer
            ),
            joinedload(
                ServiceJob.engineer
            ),
        )
        .filter(
            ServiceJob.status
            != "Completed"
        )
        .order_by(
            service_status_priority,
            ServiceJob.id.desc(),
        )
        .limit(5)
        .all()
    )

    recent_installations = (
        db.query(Installation)
        .options(
            joinedload(
                Installation.customer
            ),
            joinedload(
                Installation.engineer
            ),
        )
        .order_by(
            Installation.id.desc()
        )
        .limit(4)
        .all()
    )

    engineers = (
        db.query(Engineer)
        .filter(
            Engineer.is_active
            == True
        )
        .order_by(
            Engineer.id.desc()
        )
        .limit(5)
        .all()
    )

    low_stock_items = (
        db.query(InventoryItem)
        .filter(
            InventoryItem.quantity
            <=
            InventoryItem.reorder_level
        )
        .order_by(
            InventoryItem.quantity.asc()
        )
        .limit(5)
        .all()
    )

    return {
        "metrics": {
            "total_customers":
                total_customers,

            "total_leads":
                total_leads,

            "total_quotes":
                total_quotes,

            "active_installations":
                active_installations,

            "completed_installations":
                completed_installations,

            "open_service_jobs":
                open_jobs,

            "urgent_jobs":
                urgent_jobs,

            "available_engineers":
                available_engineers,

            "low_stock_items":
                low_stock,

            "total_invoiced":
                float(
                    total_invoiced
                ),

            "total_received":
                float(
                    total_received
                ),

            "outstanding":
                outstanding,

            "active_warranties":
                active_warranties,
        },

        "recent_jobs": [
            {
                "id":
                    job.id,

                "tracking_code":
                    job.tracking_code,

                "title":
                    job.title,

                "job_type":
                    job.job_type,

                "priority":
                    job.priority,

                "status":
                    job.status,

                "eta":
                    job.eta,

                "address":
                    job.address,

                "customer": {
                    "id":
                        job.customer.id,

                    "name":
                        job.customer.name,
                }
                if job.customer
                else None,

                "engineer": {
                    "id":
                        job.engineer.id,

                    "name":
                        job.engineer.name,
                }
                if job.engineer
                else None,
            }
            for job in recent_jobs
        ],

        "installations": [
            {
                "id":
                    installation.id,

                "system_size":
                    installation.system_size,

                "status":
                    installation.status,

                "scheduled_date":
                    installation.scheduled_date,

                "customer": {
                    "id":
                        installation.customer.id,

                    "name":
                        installation.customer.name,
                }
                if installation.customer
                else None,

                "engineer": {
                    "id":
                        installation.engineer.id,

                    "name":
                        installation.engineer.name,
                }
                if installation.engineer
                else None,
            }
            for installation
            in recent_installations
        ],

        "engineers": [
            {
                "id":
                    engineer.id,

                "name":
                    engineer.name,

                "specialization":
                    engineer.specialization,

                "status":
                    engineer.status,
            }
            for engineer
            in engineers
        ],

        "low_stock": [
            {
                "id":
                    item.id,

                "name":
                    item.name,

                "sku":
                    item.sku,

                "quantity":
                    item.quantity,

                "reorder_level":
                    item.reorder_level,
            }
            for item
            in low_stock_items
        ],
    }