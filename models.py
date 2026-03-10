from enum import Enum
from typing import Any, TypedDict


class Role(str, Enum):
    PATIENT = "patient"
    DOCTOR = "doctor"
    ADMIN = "admin"


class ReportStatus(str, Enum):
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    PARSED = "parsed"
    REVIEW_NEEDED = "review_needed"
    DOCTOR_REVIEWED = "doctor_reviewed"
    SHARED = "shared"
    ARCHIVED = "archived"


class ReportFile(TypedDict, total=False):
    report_id: Any
    patient_id: Any
    storage_type: str
    bucket: str
    object_key: str
    content_type: str
    size: int
    checksum: str
    uploaded_by: Any
    created_at: Any


class ReportAnalysis(TypedDict, total=False):
    report_id: Any
    raw_ocr_text: str
    extracted_values: dict
    verified_values: dict
    severity_score: int
    risk_level: str
    summary: str
    model_version: str
    created_at: Any
