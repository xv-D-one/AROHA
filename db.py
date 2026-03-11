from typing import Any, Mapping

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
import certifi

from config import settings


client = AsyncIOMotorClient(settings.MONGO_URI, tlsCAFile=certifi.where())
db: AsyncIOMotorDatabase = client[settings.MONGO_DB]


async def create_indexes() -> None:
    """Create the indexes required by the architecture plan.

    Idempotent: safe to call on startup.
    """
    print("Connecting to MongoDB and creating indexes...")
    try:

        await db.users.create_index("email", unique=True)
        print("Indexes created successfully.")
    except Exception as e:
        print(f"Error creating indexes: {e}")
        raise e
    await db.users.create_index("role")

    await db.patients.create_index("user_id")
    await db.doctors.create_index("user_id")

    await db.doctor_patient_assignments.create_index("doctor_id")
    await db.doctor_patient_assignments.create_index("patient_id")

    await db.reports.create_index("patient_id")
    await db.reports.create_index("status")
    await db.reports.create_index("created_at")

    await db.report_files.create_index("report_id")
    await db.report_analysis.create_index("report_id")

    await db.audit_logs.create_index("target_id")
    await db.audit_logs.create_index("actor_user_id")
    await db.audit_logs.create_index("created_at")


def collection(name: str) -> Any:
    return db.get_collection(name)
