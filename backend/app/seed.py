from datetime import datetime, timedelta

from app.database import (
    Base,
    SessionLocal,
    engine,
)

from app.models import (
    Customer,
    Engineer,
    Installation,
    InventoryItem,
    Invoice,
    JobUpdate,
    Lead,
    Quote,
    ServiceJob,
    Supplier,
    Warranty,
)


Base.metadata.create_all(
    bind=engine
)


def seed():
    db = SessionLocal()

    try:
        if db.query(Customer).count() > 5:
            print("")
            print(
                "Demo data already exists."
            )
            print("")
            return

        now = datetime.now()

        # ==========================================
        # CUSTOMERS
        # ==========================================

        customers = [
            Customer(
                name="Tariro Moyo",
                email="tariro@example.com",
                phone="+263 77 123 4567",
                address="Borrowdale, Harare",
                customer_type="Residential",
            ),

            Customer(
                name="Brighton Holdings",
                email="accounts@brighton.co.zw",
                phone="+263 24 222 8811",
                address="Eastlea, Harare",
                customer_type="Commercial",
            ),

            Customer(
                name="Ruvimbo Dube",
                email="ruvimbo@example.com",
                phone="+263 71 455 8821",
                address="Mount Pleasant, Harare",
                customer_type="Residential",
            ),

            Customer(
                name="Westgate Pharmacy",
                email="admin@westgatepharmacy.co.zw",
                phone="+263 77 803 9912",
                address="Westgate, Harare",
                customer_type="Commercial",
            ),

            Customer(
                name="Fife Avenue Clinic",
                email="admin@fifeclinic.co.zw",
                phone="+263 24 255 1182",
                address="Avenues, Harare",
                customer_type="Commercial",
            ),

            Customer(
                name="Nyasha Residence",
                email="nyasha@example.com",
                phone="+263 78 222 9123",
                address="Greendale, Harare",
                customer_type="Residential",
            ),

            Customer(
                name="Mabvuku Warehouse",
                email="operations@mabvuku.co.zw",
                phone="+263 71 900 4411",
                address="Mabvuku, Harare",
                customer_type="Industrial",
            ),
        ]

        db.add_all(customers)
        db.commit()

        for customer in customers:
            db.refresh(customer)

        # ==========================================
        # ENGINEERS
        # ==========================================

        engineers = [
            Engineer(
                name="Tawanda Mupfumi",
                email="tawanda@solarflow.co.zw",
                phone="+263 77 555 0198",
                specialization=(
                    "Solar & Inverter Systems"
                ),
                status="On Job",
            ),

            Engineer(
                name="Kudakwashe Ncube",
                email="kuda@solarflow.co.zw",
                phone="+263 77 441 7821",
                specialization=(
                    "Solar Installation"
                ),
                status="On Job",
            ),

            Engineer(
                name="Simba Nyathi",
                email="simba@solarflow.co.zw",
                phone="+263 71 885 2281",
                specialization=(
                    "Battery Systems"
                ),
                status="On Job",
            ),

            Engineer(
                name="Rufaro Chuma",
                email="rufaro@solarflow.co.zw",
                phone="+263 78 221 8812",
                specialization=(
                    "Solar Technician"
                ),
                status="Available",
            ),

            Engineer(
                name="Farai Mlambo",
                email="farai@solarflow.co.zw",
                phone="+263 77 391 8842",
                specialization=(
                    "Commercial Solar"
                ),
                status="Available",
            ),
        ]

        db.add_all(engineers)
        db.commit()

        for engineer in engineers:
            db.refresh(engineer)

        # ==========================================
        # LEADS
        # ==========================================

        leads = [
            Lead(
                name="Mukuvisi Lodge",
                phone="+263 77 222 1134",
                email="info@mukuvisi.example",
                source="Website",
                status="Quote Sent",
                notes="20kVA commercial system",
                estimated_value=14500,
            ),

            Lead(
                name="Tanaka Zhou",
                phone="+263 71 552 8812",
                source="WhatsApp",
                status="New",
                estimated_value=4200,
            ),

            Lead(
                name="Greendale Hardware",
                phone="+263 77 113 9921",
                source="Referral",
                status="Site Visit",
                estimated_value=9800,
            ),

            Lead(
                name="Arundel Offices",
                phone="+263 78 551 2244",
                source="Phone Call",
                status="Won",
                estimated_value=12500,
            ),
        ]

        db.add_all(leads)

        # ==========================================
        # QUOTES
        # ==========================================

        quotes = [
            Quote(
                customer_id=customers[0].id,
                quote_number="QUO-DEMO001",
                description=(
                    "5kVA hybrid solar system, "
                    "10kWh lithium battery and "
                    "8 solar panels."
                ),
                total=5200,
                status="Accepted",
            ),

            Quote(
                customer_id=customers[1].id,
                quote_number="QUO-DEMO002",
                description=(
                    "10kVA commercial solar "
                    "installation."
                ),
                total=11800,
                status="Sent",
            ),

            Quote(
                customer_id=customers[4].id,
                quote_number="QUO-DEMO003",
                description=(
                    "15kVA medical facility "
                    "backup solar system."
                ),
                total=17500,
                status="Draft",
            ),
        ]

        db.add_all(quotes)

        # ==========================================
        # INSTALLATIONS
        # ==========================================

        installations = [
            Installation(
                customer_id=customers[5].id,
                engineer_id=engineers[1].id,
                system_size="5kVA Hybrid",
                inverter=(
                    "5kVA Hybrid Inverter"
                ),
                battery="10kWh Lithium",
                panels="8 x 550W",
                installation_address=(
                    customers[5].address
                ),
                status="Scheduled",
                scheduled_date=(
                    now + timedelta(days=1)
                ),
            ),

            Installation(
                customer_id=customers[4].id,
                engineer_id=engineers[4].id,
                system_size="10kVA Commercial",
                inverter=(
                    "10kVA Hybrid Inverter"
                ),
                battery="20kWh Lithium",
                panels="16 x 550W",
                installation_address=(
                    customers[4].address
                ),
                status="In Progress",
                scheduled_date=now,
            ),

            Installation(
                customer_id=customers[6].id,
                engineer_id=None,
                system_size="20kVA Commercial",
                inverter="20kVA Inverter",
                battery="40kWh Lithium",
                panels="32 x 550W",
                installation_address=(
                    customers[6].address
                ),
                status="Site Survey",
                scheduled_date=(
                    now + timedelta(days=2)
                ),
            ),

            Installation(
                customer_id=customers[1].id,
                engineer_id=engineers[4].id,
                system_size="8kVA Hybrid",
                inverter="8kVA Inverter",
                battery="15kWh Lithium",
                panels="12 x 550W",
                installation_address=(
                    customers[1].address
                ),
                status="Completed",
                scheduled_date=(
                    now - timedelta(days=15)
                ),
                completed_at=(
                    now - timedelta(days=14)
                ),
            ),
        ]

        db.add_all(installations)
        db.commit()

        for installation in installations:
            db.refresh(installation)

        # ==========================================
        # SERVICE JOBS
        # ==========================================

        eta = now + timedelta(minutes=45)

        jobs = [
            ServiceJob(
                tracking_code="SOL-DEMO1048",
                customer_id=customers[0].id,
                engineer_id=engineers[0].id,
                job_type="Fault",
                title=(
                    "Inverter not charging "
                    "batteries"
                ),
                description=(
                    "Inverter is powered but "
                    "batteries are not charging."
                ),
                address=customers[0].address,
                priority="Urgent",
                status="On Route",
                eta=eta,
            ),

            ServiceJob(
                tracking_code="SOL-DEMO1047",
                customer_id=customers[1].id,
                engineer_id=engineers[1].id,
                job_type="Installation",
                title=(
                    "10kVA commercial "
                    "installation"
                ),
                description=(
                    "Full new commercial "
                    "installation."
                ),
                address=customers[1].address,
                priority="Normal",
                status="Working",
            ),

            ServiceJob(
                tracking_code="SOL-DEMO1046",
                customer_id=customers[2].id,
                engineer_id=engineers[2].id,
                job_type="Maintenance",
                title="Battery inspection",
                description=(
                    "Customer reported reduced "
                    "battery runtime."
                ),
                address=customers[2].address,
                priority="Normal",
                status="Arrived",
            ),

            ServiceJob(
                tracking_code="SOL-DEMO1045",
                customer_id=customers[3].id,
                engineer_id=engineers[3].id,
                job_type="Fault",
                title="Solar panel fault",
                description=(
                    "Low generation from one "
                    "panel string."
                ),
                address=customers[3].address,
                priority="Normal",
                status="Completed",
                completed_at=(
                    now - timedelta(days=1)
                ),
                fault_confirmed_fixed=True,
                customer_confirmed=True,
            ),
        ]

        db.add_all(jobs)
        db.commit()

        for job in jobs:
            db.refresh(job)

        updates = [
            JobUpdate(
                job_id=jobs[0].id,
                status="Request Received",
                note=(
                    "Fault reported by customer."
                ),
                created_at=(
                    now - timedelta(minutes=55)
                ),
            ),

            JobUpdate(
                job_id=jobs[0].id,
                status="Accepted",
                note=(
                    "Service request accepted."
                ),
                created_at=(
                    now - timedelta(minutes=48)
                ),
            ),

            JobUpdate(
                job_id=jobs[0].id,
                status="Engineer Assigned",
                note=(
                    "Tawanda Mupfumi assigned."
                ),
                created_at=(
                    now - timedelta(minutes=35)
                ),
            ),

            JobUpdate(
                job_id=jobs[0].id,
                status="On Route",
                note=(
                    "Engineer is travelling "
                    "to customer."
                ),
                created_at=(
                    now - timedelta(minutes=12)
                ),
            ),

            JobUpdate(
                job_id=jobs[1].id,
                status="Working",
                note=(
                    "Installation team is "
                    "mounting equipment."
                ),
            ),

            JobUpdate(
                job_id=jobs[2].id,
                status="Arrived",
                note=(
                    "Engineer arrived for "
                    "battery inspection."
                ),
            ),

            JobUpdate(
                job_id=jobs[3].id,
                status="Completed",
                note=(
                    "Panel connection repaired "
                    "and customer confirmed."
                ),
            ),
        ]

        db.add_all(updates)

        # ==========================================
        # INVENTORY
        # ==========================================

        inventory = [
            InventoryItem(
                name="5kWh Lithium Battery",
                sku="BAT-5K-LFP",
                category="Batteries",
                quantity=3,
                reorder_level=5,
                unit_cost=850,
                selling_price=1100,
            ),

            InventoryItem(
                name="550W Solar Panel",
                sku="PNL-550-MONO",
                category="Solar Panels",
                quantity=7,
                reorder_level=10,
                unit_cost=120,
                selling_price=165,
            ),

            InventoryItem(
                name="5kVA Hybrid Inverter",
                sku="INV-5K-HYB",
                category="Inverters",
                quantity=12,
                reorder_level=4,
                unit_cost=620,
                selling_price=850,
            ),

            InventoryItem(
                name="6mm Solar Cable",
                sku="CAB-6MM",
                category="Cables",
                quantity=2,
                reorder_level=8,
                unit_cost=18,
                selling_price=28,
            ),

            InventoryItem(
                name="10kWh Lithium Battery",
                sku="BAT-10K-LFP",
                category="Batteries",
                quantity=11,
                reorder_level=4,
                unit_cost=1550,
                selling_price=1950,
            ),

            InventoryItem(
                name="10kVA Hybrid Inverter",
                sku="INV-10K-HYB",
                category="Inverters",
                quantity=6,
                reorder_level=3,
                unit_cost=1450,
                selling_price=1850,
            ),
        ]

        db.add_all(inventory)

        # ==========================================
        # SUPPLIERS
        # ==========================================

        suppliers = [
            Supplier(
                name="SunPower Distribution",
                contact_person="David Moyo",
                phone="+263 77 820 1144",
                email=(
                    "sales@sunpower.example"
                ),
            ),

            Supplier(
                name="Energy Hub Zimbabwe",
                contact_person="Ruth Banda",
                phone="+263 71 228 8811",
                email=(
                    "orders@energyhub.example"
                ),
            ),

            Supplier(
                name="Lithium Africa",
                contact_person="Brian Ncube",
                phone="+263 78 003 9912",
                email=(
                    "sales@lithiumafrica.example"
                ),
            ),
        ]

        db.add_all(suppliers)

        # ==========================================
        # INVOICES
        # ==========================================

        invoices = [
            Invoice(
                customer_id=customers[0].id,
                invoice_number="INV-DEMO001",
                amount=5200,
                amount_paid=5200,
                status="Paid",
            ),

            Invoice(
                customer_id=customers[1].id,
                invoice_number="INV-DEMO002",
                amount=11800,
                amount_paid=5900,
                status="Partially Paid",
            ),

            Invoice(
                customer_id=customers[4].id,
                invoice_number="INV-DEMO003",
                amount=17500,
                amount_paid=0,
                status="Unpaid",
            ),

            Invoice(
                customer_id=customers[3].id,
                invoice_number="INV-DEMO004",
                amount=850,
                amount_paid=850,
                status="Paid",
            ),
        ]

        db.add_all(invoices)

        # ==========================================
        # WARRANTIES
        # ==========================================

        warranties = [
            Warranty(
                customer_id=customers[1].id,
                installation_id=(
                    installations[3].id
                ),
                item_name=(
                    "8kVA Hybrid Inverter"
                ),
                serial_number=(
                    "INV-8K-2026-4431"
                ),
                status="Active",
            ),

            Warranty(
                customer_id=customers[1].id,
                installation_id=(
                    installations[3].id
                ),
                item_name=(
                    "15kWh Lithium Battery"
                ),
                serial_number=(
                    "BAT-15K-2026-1138"
                ),
                status="Active",
            ),
        ]

        db.add_all(warranties)

        db.commit()

        print("")
        print(
            "Full SolarFlow demo data created."
        )
        print(
            "Tracking code: SOL-DEMO1048"
        )
        print("")

    finally:
        db.close()


if __name__ == "__main__":
    seed()