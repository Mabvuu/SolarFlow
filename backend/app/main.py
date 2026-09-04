from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine

from app.routers import (
    customer_portal,
    customers,
    dashboard,
    engineers,
    installations,
    inventory,
    invoices,
    jobs,
    leads,
    quotes,
    reports,
    suppliers,
    warranties,
)


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
)


# Demo deployment:
# allow the Vercel frontend and preview deployments to call the API
# without origin-matching issues.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(dashboard.router)
app.include_router(customers.router)
app.include_router(engineers.router)
app.include_router(jobs.router)
app.include_router(leads.router)
app.include_router(quotes.router)
app.include_router(installations.router)
app.include_router(inventory.router)
app.include_router(suppliers.router)
app.include_router(invoices.router)
app.include_router(warranties.router)
app.include_router(reports.router)
app.include_router(customer_portal.router)


@app.get("/")
def root():
    return {
        "message": "Solar ERP API running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }
