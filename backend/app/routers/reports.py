from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

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
    prefix="/reports",
    tags=["Reports"],
)


@router.get("/overview")
def get_reports_overview(
    db: Session = Depends(get_db),
):
    total_customers = (
        db.query(Customer).count()
    )

    total_leads = (
        db.query(Lead).count()
    )

    won_leads = (
        db.query(Lead)
        .filter(Lead.status == "Won")
        .count()
    )

    total_quotes = (
        db.query(Quote).count()
    )

    accepted_quotes = (
        db.query(Quote)
        .filter(
            Quote.status == "Accepted"
        )
        .count()
    )

    quote_value = (
        db.query(
            func.coalesce(
                func.sum(Quote.total),
                0
            )
        )
        .scalar()
    )

    accepted_quote_value = (
        db.query(
            func.coalesce(
                func.sum(Quote.total),
                0
            )
        )
        .filter(
            Quote.status == "Accepted"
        )
        .scalar()
    )

    total_installations = (
        db.query(Installation).count()
    )

    completed_installations = (
        db.query(Installation)
        .filter(
            Installation.status == "Completed"
        )
        .count()
    )

    total_jobs = (
        db.query(ServiceJob).count()
    )

    completed_jobs = (
        db.query(ServiceJob)
        .filter(
            ServiceJob.status == "Completed"
        )
        .count()
    )

    urgent_open_jobs = (
        db.query(ServiceJob)
        .filter(
            ServiceJob.priority == "Urgent",
            ServiceJob.status != "Completed",
        )
        .count()
    )

    total_invoiced = (
        db.query(
            func.coalesce(
                func.sum(Invoice.amount),
                0
            )
        )
        .scalar()
    )

    total_received = (
        db.query(
            func.coalesce(
                func.sum(Invoice.amount_paid),
                0
            )
        )
        .scalar()
    )

    outstanding = max(
        float(total_invoiced)
        - float(total_received),
        0,
    )

    inventory_cost_value = (
        db.query(
            func.coalesce(
                func.sum(
                    InventoryItem.quantity
                    * InventoryItem.unit_cost
                ),
                0
            )
        )
        .scalar()
    )

    inventory_retail_value = (
        db.query(
            func.coalesce(
                func.sum(
                    InventoryItem.quantity
                    * InventoryItem.selling_price
                ),
                0
            )
        )
        .scalar()
    )

    low_stock_items = (
        db.query(InventoryItem)
        .filter(
            InventoryItem.quantity
            <= InventoryItem.reorder_level
        )
        .count()
    )

    active_warranties = (
        db.query(Warranty)
        .filter(
            Warranty.status == "Active"
        )
        .count()
    )

    available_engineers = (
        db.query(Engineer)
        .filter(
            Engineer.status == "Available",
            Engineer.is_active == True,
        )
        .count()
    )

    lead_conversion_rate = (
        (won_leads / total_leads) * 100
        if total_leads
        else 0
    )

    quote_acceptance_rate = (
        (
            accepted_quotes
            / total_quotes
        ) * 100
        if total_quotes
        else 0
    )

    job_completion_rate = (
        (
            completed_jobs
            / total_jobs
        ) * 100
        if total_jobs
        else 0
    )

    return {
        "sales": {
            "total_leads": total_leads,
            "won_leads": won_leads,
            "lead_conversion_rate": round(
                lead_conversion_rate,
                1
            ),
            "total_quotes": total_quotes,
            "accepted_quotes": accepted_quotes,
            "quote_acceptance_rate": round(
                quote_acceptance_rate,
                1
            ),
            "quote_value": float(
                quote_value
            ),
            "accepted_quote_value": float(
                accepted_quote_value
            ),
        },

        "operations": {
            "total_customers": total_customers,
            "total_installations": total_installations,
            "completed_installations": (
                completed_installations
            ),
            "total_service_jobs": total_jobs,
            "completed_service_jobs": (
                completed_jobs
            ),
            "job_completion_rate": round(
                job_completion_rate,
                1
            ),
            "urgent_open_jobs": urgent_open_jobs,
            "available_engineers": (
                available_engineers
            ),
        },

        "finance": {
            "total_invoiced": float(
                total_invoiced
            ),
            "total_received": float(
                total_received
            ),
            "outstanding": outstanding,
        },

        "inventory": {
            "cost_value": float(
                inventory_cost_value
            ),
            "retail_value": float(
                inventory_retail_value
            ),
            "low_stock_items": low_stock_items,
        },

        "warranties": {
            "active_warranties": (
                active_warranties
            ),
        },
    }