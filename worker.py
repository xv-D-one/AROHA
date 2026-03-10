"""Background worker for OCR/analysis using Arq and Redis."""

import asyncio
from datetime import datetime
from tempfile import NamedTemporaryFile

from arq import Worker
from arq.connections import RedisSettings

from db import db, create_indexes
from ai_pipeline import analyze_medical_report_local
from models import ReportStatus
from s3_client import s3_client
from config import settings


async def startup(ctx):
    await create_indexes()
    print("Worker started")


async def shutdown(ctx):
    print("Worker shutting down")


async def process_report_task(ctx, report_file: dict) -> None:
    report_id = report_file["report_id"]
    bucket = report_file["bucket"]
    key = report_file["object_key"]

    # Mark as processing
    await db.reports.update_one(
        {"_id": report_id},
        {"$set": {"status": ReportStatus.PROCESSING.value, "updated_at": datetime.utcnow()}},
    )

    s3 = s3_client()
    obj = s3.get_object(Bucket=bucket, Key=key)
    data = obj["Body"].read()

    with NamedTemporaryFile(suffix=".pdf") as tmp:
        tmp.write(data)
        tmp.flush()
        result = analyze_medical_report_local(tmp.name, age="30", gender="Unknown")

    analysis_doc = {
        "report_id": report_id,
        "raw_ocr_text": result.get("diagnosis", ""),
        "extracted_values": dict(zip(result.get("chart_labels", []), result.get("chart_values", []))),
        "verified_values": {},
        "severity_score": result.get("severity_score"),
        "risk_level": result.get("risk_level"),
        "summary": result.get("synopsis"),
        "model_version": "local-rule",
        "created_at": datetime.utcnow(),
    }

    await db.report_analysis.insert_one(analysis_doc)
    
    # Needs doctor review if severity > 0 or based on risk
    new_status = ReportStatus.REVIEW_NEEDED.value if result.get("severity_score", 0) > 0 else ReportStatus.PARSED.value
    
    await db.reports.update_one(
        {"_id": report_id},
        {"$set": {"status": new_status, "updated_at": datetime.utcnow()}},
    )
    print(f"Processed report {report_id}, new status: {new_status}")


class WorkerSettings:
    functions = [process_report_task]
    redis_settings = RedisSettings.from_dsn(settings.QUEUE_URL or "redis://localhost:6379/0")
    on_startup = startup
    on_shutdown = shutdown

if __name__ == "__main__":
    import asyncio
    from arq.worker import run_worker
    asyncio.run(run_worker(WorkerSettings))
