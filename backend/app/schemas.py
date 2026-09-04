from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


# =========================================================
# CUSTOMERS
# =========================================================

class CustomerCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    customer_type: str = "Residential"


class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    customer_type: Optional[str] = None


class CustomerRead(BaseModel):
    id: int
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    customer_type: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# =========================================================
# ENGINEERS
# =========================================================

class EngineerCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    specialization: Optional[str] = None
    status: str = "Available"


class EngineerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    specialization: Optional[str] = None
    status: Optional[str] = None
    is_active: Optional[bool] = None


class EngineerRead(BaseModel):
    id: int
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    specialization: Optional[str] = None
    status: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# =========================================================
# LEADS
# =========================================================

class LeadCreate(BaseModel):
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    source: Optional[str] = None
    status: str = "New"
    notes: Optional[str] = None
    estimated_value: float = 0


class LeadUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    source: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    estimated_value: Optional[float] = None


class LeadRead(BaseModel):
    id: int
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    source: Optional[str] = None
    status: str
    notes: Optional[str] = None
    estimated_value: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# =========================================================
# QUOTES
# =========================================================

class QuoteCreate(BaseModel):
    customer_id: int
    description: Optional[str] = None
    total: float = 0
    status: str = "Draft"


class QuoteStatusUpdate(BaseModel):
    status: str


class QuoteRead(BaseModel):
    id: int
    customer_id: Optional[int] = None
    quote_number: str
    description: Optional[str] = None
    total: float
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# =========================================================
# INSTALLATIONS
# =========================================================

class InstallationCreate(BaseModel):
    customer_id: int
    engineer_id: Optional[int] = None
    system_size: Optional[str] = None
    inverter: Optional[str] = None
    battery: Optional[str] = None
    panels: Optional[str] = None
    installation_address: Optional[str] = None
    status: str = "Scheduled"
    scheduled_date: Optional[datetime] = None


class InstallationStatusUpdate(BaseModel):
    status: str


class InstallationRead(BaseModel):
    id: int
    customer_id: int
    engineer_id: Optional[int] = None
    system_size: Optional[str] = None
    inverter: Optional[str] = None
    battery: Optional[str] = None
    panels: Optional[str] = None
    installation_address: Optional[str] = None
    status: str
    scheduled_date: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# =========================================================
# SERVICE JOBS
# =========================================================

class ServiceJobCreate(BaseModel):
    customer_id: int
    engineer_id: Optional[int] = None
    job_type: str = "Fault"
    title: str
    description: Optional[str] = None
    address: Optional[str] = None
    priority: str = "Normal"
    eta: Optional[datetime] = None


class ServiceJobStatusUpdate(BaseModel):
    status: str
    note: Optional[str] = None
    eta: Optional[datetime] = None


class JobUpdateRead(BaseModel):
    id: int
    status: str
    note: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# =========================================================
# INVENTORY
# =========================================================

class InventoryCreate(BaseModel):
    name: str
    sku: Optional[str] = None
    category: Optional[str] = None
    quantity: int = 0
    reorder_level: int = 5
    unit_cost: float = 0
    selling_price: float = 0


class InventoryUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    category: Optional[str] = None
    quantity: Optional[int] = None
    reorder_level: Optional[int] = None
    unit_cost: Optional[float] = None
    selling_price: Optional[float] = None


class InventoryQuantityUpdate(BaseModel):
    quantity: int


class InventoryRead(BaseModel):
    id: int
    name: str
    sku: Optional[str] = None
    category: Optional[str] = None
    quantity: int
    reorder_level: int
    unit_cost: float
    selling_price: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# =========================================================
# SUPPLIERS
# =========================================================

class SupplierCreate(BaseModel):
    name: str
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None


class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None


class SupplierRead(BaseModel):
    id: int
    name: str
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# =========================================================
# INVOICES
# =========================================================

class InvoiceCreate(BaseModel):
    customer_id: int
    amount: float
    amount_paid: float = 0
    status: str = "Unpaid"


class InvoicePaymentUpdate(BaseModel):
    amount_paid: float


class InvoiceStatusUpdate(BaseModel):
    status: str


class InvoiceRead(BaseModel):
    id: int
    customer_id: int
    invoice_number: str
    amount: float
    amount_paid: float
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# =========================================================
# WARRANTIES
# =========================================================

class WarrantyCreate(BaseModel):
    customer_id: int
    installation_id: Optional[int] = None
    item_name: str
    serial_number: Optional[str] = None
    status: str = "Active"


class WarrantyStatusUpdate(BaseModel):
    status: str


class WarrantyRead(BaseModel):
    id: int
    customer_id: int
    installation_id: Optional[int] = None
    item_name: str
    serial_number: Optional[str] = None
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)