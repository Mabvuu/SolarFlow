from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    Text,
    Boolean,
    ForeignKey
)

from sqlalchemy.orm import relationship

from app.database import Base


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(150), nullable=False)
    email = Column(String(150), nullable=True)
    phone = Column(String(50), nullable=True)
    address = Column(String(255), nullable=True)

    customer_type = Column(
        String(50),
        default="Residential"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


class Engineer(Base):
    __tablename__ = "engineers"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(150), nullable=False)
    email = Column(String(150), nullable=True)
    phone = Column(String(50), nullable=True)

    specialization = Column(String(100), nullable=True)

    status = Column(
        String(50),
        default="Available"
    )

    is_active = Column(
        Boolean,
        default=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(150), nullable=False)
    phone = Column(String(50), nullable=True)
    email = Column(String(150), nullable=True)

    source = Column(String(100), nullable=True)

    status = Column(
        String(50),
        default="New"
    )

    notes = Column(Text, nullable=True)

    estimated_value = Column(
        Float,
        default=0
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


class Quote(Base):
    __tablename__ = "quotes"

    id = Column(Integer, primary_key=True, index=True)

    customer_id = Column(
        Integer,
        ForeignKey("customers.id"),
        nullable=True
    )

    quote_number = Column(
        String(100),
        unique=True,
        index=True
    )

    description = Column(Text, nullable=True)

    total = Column(
        Float,
        default=0
    )

    status = Column(
        String(50),
        default="Draft"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    customer = relationship("Customer")


class Installation(Base):
    __tablename__ = "installations"

    id = Column(Integer, primary_key=True, index=True)

    customer_id = Column(
        Integer,
        ForeignKey("customers.id")
    )

    engineer_id = Column(
        Integer,
        ForeignKey("engineers.id"),
        nullable=True
    )

    system_size = Column(String(100), nullable=True)

    inverter = Column(String(150), nullable=True)
    battery = Column(String(150), nullable=True)
    panels = Column(String(150), nullable=True)

    installation_address = Column(
        String(255),
        nullable=True
    )

    status = Column(
        String(50),
        default="Scheduled"
    )

    scheduled_date = Column(
        DateTime,
        nullable=True
    )

    completed_at = Column(
        DateTime,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    customer = relationship("Customer")
    engineer = relationship("Engineer")


class ServiceJob(Base):
    __tablename__ = "service_jobs"

    id = Column(Integer, primary_key=True, index=True)

    tracking_code = Column(
        String(100),
        unique=True,
        index=True,
        nullable=False
    )

    customer_id = Column(
        Integer,
        ForeignKey("customers.id")
    )

    engineer_id = Column(
        Integer,
        ForeignKey("engineers.id"),
        nullable=True
    )

    job_type = Column(
        String(50),
        default="Fault"
    )

    title = Column(String(200), nullable=False)

    description = Column(Text, nullable=True)

    address = Column(String(255), nullable=True)

    priority = Column(
        String(50),
        default="Normal"
    )

    status = Column(
        String(50),
        default="Request Received"
    )

    eta = Column(
        DateTime,
        nullable=True
    )

    fault_confirmed_fixed = Column(
        Boolean,
        default=False
    )

    customer_confirmed = Column(
        Boolean,
        default=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    completed_at = Column(
        DateTime,
        nullable=True
    )

    customer = relationship("Customer")
    engineer = relationship("Engineer")

    updates = relationship(
        "JobUpdate",
        back_populates="job",
        cascade="all, delete-orphan"
    )


class JobUpdate(Base):
    __tablename__ = "job_updates"

    id = Column(Integer, primary_key=True, index=True)

    job_id = Column(
        Integer,
        ForeignKey("service_jobs.id")
    )

    status = Column(String(100), nullable=False)

    note = Column(Text, nullable=True)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    job = relationship(
        "ServiceJob",
        back_populates="updates"
    )


class InventoryItem(Base):
    __tablename__ = "inventory_items"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(150), nullable=False)

    sku = Column(
        String(100),
        unique=True,
        nullable=True
    )

    category = Column(String(100), nullable=True)

    quantity = Column(
        Integer,
        default=0
    )

    reorder_level = Column(
        Integer,
        default=5
    )

    unit_cost = Column(
        Float,
        default=0
    )

    selling_price = Column(
        Float,
        default=0
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(150), nullable=False)

    contact_person = Column(
        String(150),
        nullable=True
    )

    phone = Column(String(50), nullable=True)
    email = Column(String(150), nullable=True)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)

    customer_id = Column(
        Integer,
        ForeignKey("customers.id")
    )

    invoice_number = Column(
        String(100),
        unique=True
    )

    amount = Column(
        Float,
        default=0
    )

    amount_paid = Column(
        Float,
        default=0
    )

    status = Column(
        String(50),
        default="Unpaid"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    customer = relationship("Customer")


class Warranty(Base):
    __tablename__ = "warranties"

    id = Column(Integer, primary_key=True, index=True)

    customer_id = Column(
        Integer,
        ForeignKey("customers.id")
    )

    installation_id = Column(
        Integer,
        ForeignKey("installations.id"),
        nullable=True
    )

    item_name = Column(String(150), nullable=False)

    serial_number = Column(
        String(150),
        nullable=True
    )

    status = Column(
        String(50),
        default="Active"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )