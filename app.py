import os
import shutil
from datetime import datetime
from uuid import uuid4
from bson import ObjectId

from fastapi import FastAPI, Request, File, UploadFile, Form, Depends, HTTPException, status
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from fastapi.security import OAuth2PasswordRequestForm
import uvicorn

from ai_pipeline import analyze_medical_report_local
from config import settings
from db import db, create_indexes
from models import ReportStatus, Role
from s3_client import upload_bytes, presign_get_url
from auth import get_current_user, CurrentUser, authenticate_user, create_access_token, get_password_hash
from audit import log_event

print("APP FILE RUNNING FROM:", __file__)

app = FastAPI()

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

templates = Jinja2Templates(directory="templates")


from arq import create_pool
from arq.connections import RedisSettings

@app.on_event("startup")
async def startup_event():
    await create_indexes()
    app.state.redis = await create_pool(RedisSettings.from_dsn(settings.QUEUE_URL or "redis://localhost:6379/0"))

@app.on_event("shutdown")
async def shutdown_event():
    if hasattr(app.state, "redis"):
        app.state.redis.close()
        await app.state.redis.wait_closed()


# ---------------- HOME PAGE ----------------

@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


# ---------------- PATIENT VIEW ----------------

@app.get("/patient", response_class=HTMLResponse)
async def patient_get(request: Request):
    return templates.TemplateResponse("patient.html", {"request": request, "result": None})


@app.post("/patient", response_class=HTMLResponse)
async def patient_post(
    request: Request,
    file: UploadFile = File(...),
    age: str = Form(...),
    gender: str = Form(...),
    user: CurrentUser = Depends(get_current_user),
):
    if user.role != Role.PATIENT:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Patients only")

    if not file or not file.filename:
        return HTMLResponse("Please upload a report", status_code=400)

    # 1) Upload file to S3
    raw_bytes = await file.read()
    object_key = f"reports/{user.patient_id}/{uuid4()}-{file.filename}"
    upload_bytes(object_key, raw_bytes, file.content_type or "application/octet-stream")

    # 2) Create report + file metadata in Mongo
    report_doc = {
        "patient_id": user.patient_id,
        "uploaded_by": user.user_id,
        "status": ReportStatus.UPLOADED.value,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    report_result = await db.reports.insert_one(report_doc)

    report_file_doc = {
        "report_id": report_result.inserted_id,
        "patient_id": user.patient_id,
        "storage_type": "s3",
        "bucket": settings.S3_BUCKET,
        "object_key": object_key,
        "content_type": file.content_type,
        "size": len(raw_bytes),
        "checksum": None,
        "uploaded_by": user.user_id,
        "created_at": datetime.utcnow(),
    }
    await db.report_files.insert_one(report_file_doc)

    # 3) Enqueue for background processing
    await app.state.redis.enqueue_job("process_report_task", {
        "report_id": report_result.inserted_id,
        "bucket": settings.S3_BUCKET,
        "object_key": object_key
    })

    await log_event(user.user_id, "report_uploaded", "report", report_result.inserted_id, {"object_key": object_key})

    presigned = presign_get_url(object_key)

    return templates.TemplateResponse(
        "patient.html",
        {
            "request": request,
            "result": {"synopsis": "Report received. Processing..."},
            "download_url": presigned,
        },
    )


# ---------------- AUTH ----------------

@app.post("/auth/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token(
        {
            "sub": str(user["_id"]),
            "role": user.get("role"),
            "patient_id": user.get("patient_id"),
            "doctor_id": user.get("doctor_id"),
        }
    )
    await log_event(str(user["_id"]), "login", "user", str(user["_id"]))
    return {"access_token": token, "token_type": "bearer"}


@app.post("/auth/signup/patient")
async def signup_patient(email: str = Form(...), password: str = Form(...)):
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_doc = {
        "email": email,
        "password_hash": get_password_hash(password),
        "role": Role.PATIENT.value,
        "patient_id": str(uuid4()),
        "created_at": datetime.utcnow(),
    }
    result = await db.users.insert_one(user_doc)
    await log_event(str(result.inserted_id), "signup", "user", str(result.inserted_id))
    return {"message": "Patient created"}


# ---------------- DOCTOR VIEW ----------------

@app.get("/doctor", response_class=HTMLResponse)
async def doctor(request: Request):
    return templates.TemplateResponse("doctor.html", {"request": request})


@app.post("/upload_doctor", response_class=HTMLResponse)
async def upload_doctor(request: Request, report: UploadFile = File(...)):
    if not report or not report.filename:
        return HTMLResponse("Please upload a report", status_code=400)
    
    filepath = os.path.join(UPLOAD_FOLDER, report.filename)
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(report.file, buffer)
    
    result = analyze_medical_report_local(filepath, "30", "M")
    
    analysis = {
        "summary": result["synopsis"],
        "alerts": result["findings"],
        "report_type": result.get("report_type", "Unknown")
    }
    
    return templates.TemplateResponse("doctor.html", {"request": request, "analysis": analysis})


# ---------------- COMPARE VIEW ----------------

@app.get("/compare", response_class=HTMLResponse)
async def compare(request: Request):
    return templates.TemplateResponse("compare.html", {"request": request})


@app.post("/compare_reports", response_class=HTMLResponse)
async def compare_reports(request: Request, report1: UploadFile = File(...), report2: UploadFile = File(...)):
    if not report1 or not report2:
        return HTMLResponse("Please upload both reports", status_code=400)
    
    filepath1 = os.path.join(UPLOAD_FOLDER, report1.filename)
    with open(filepath1, "wb") as buffer:
        shutil.copyfileobj(report1.file, buffer)
        
    filepath2 = os.path.join(UPLOAD_FOLDER, report2.filename)
    with open(filepath2, "wb") as buffer:
        shutil.copyfileobj(report2.file, buffer)
    
    analysis1 = analyze_medical_report_local(filepath1, "30", "M")
    analysis2 = analyze_medical_report_local(filepath2, "30", "M")
    
    comparison = []
    
    if analysis1["severity_score"] != analysis2["severity_score"]:
        comparison.append(f"Severity score: {analysis1['severity_score']} vs {analysis2['severity_score']}")
    
    if analysis1["risk_level"] != analysis2["risk_level"]:
        comparison.append(f"Risk level: {analysis1['risk_level']} vs {analysis2['risk_level']}")
    
    labs1 = dict(zip(analysis1["chart_labels"], analysis1["chart_values"]))
    labs2 = dict(zip(analysis2["chart_labels"], analysis2["chart_values"]))
    
    for key in set(labs1.keys()) | set(labs2.keys()):
        val1 = labs1.get(key, "N/A")
        val2 = labs2.get(key, "N/A")
        if val1 != val2:
            comparison.append(f"{key}: {val1} vs {val2}")
    
    return templates.TemplateResponse("compare.html", {"request": request, "comparison": comparison, "analysis1": analysis1, "analysis2": analysis2})


# ---------------- ADMIN / DOCTOR APIS ----------------

@app.get("/reports")
async def list_reports(user: CurrentUser = Depends(get_current_user)):
    query = {}
    if user.role == Role.PATIENT:
        query["patient_id"] = user.patient_id
    elif user.role == Role.DOCTOR:
        assignments = await db.doctor_patient_assignments.find({"doctor_id": user.doctor_id}).to_list(length=None)
        patient_ids = [a["patient_id"] for a in assignments]
        if not patient_ids:
            return {"reports": []}
        query["patient_id"] = {"$in": patient_ids}
    # admin sees all

    reports = []
    async for rep in db.reports.find(query):
        reports.append(
            {
                "id": str(rep["_id"]),
                "status": rep["status"],
                "created_at": rep["created_at"],
            }
        )
    await log_event(user.user_id, "list_reports", "query", "reports")
    return {"reports": reports}


@app.post("/reports/{report_id}/verify")
async def verify_report(report_id: str, user: CurrentUser = Depends(get_current_user)):
    if user.role != Role.DOCTOR:
        raise HTTPException(status_code=403, detail="Doctors only")

    oid = ObjectId(report_id)
    report = await db.reports.find_one({"_id": oid})
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    assignment = await db.doctor_patient_assignments.find_one({
        "doctor_id": user.doctor_id,
        "patient_id": report["patient_id"]
    })
    if not assignment and user.role != Role.ADMIN:
        raise HTTPException(status_code=403, detail="Not assigned to this patient")

    await db.reports.update_one(
        {"_id": oid},
        {"$set": {"status": ReportStatus.DOCTOR_REVIEWED.value, "updated_at": datetime.utcnow()}},
    )
    await log_event(user.user_id, "report_verified", "report", report_id)
    return {"message": "Report verified"}

@app.post("/admin/assign")
async def assign_doctor(doctor_id: str = Form(...), patient_id: str = Form(...), user: CurrentUser = Depends(get_current_user)):
    if user.role != Role.ADMIN:
        raise HTTPException(status_code=403, detail="Admins only")
        
    await db.doctor_patient_assignments.insert_one({
        "doctor_id": doctor_id,
        "patient_id": patient_id,
        "created_at": datetime.utcnow()
    })
    await log_event(user.user_id, "assign_doctor", "doctor", doctor_id, {"patient_id": patient_id})
    return {"message": "Assignment created"}

@app.post("/auth/signup/doctor")
async def signup_doctor(email: str = Form(...), password: str = Form(...)): # Not requiring admin for demo
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_doc = {
        "email": email,
        "password_hash": get_password_hash(password),
        "role": Role.DOCTOR.value,
        "doctor_id": str(uuid4()),
        "created_at": datetime.utcnow(),
    }
    result = await db.users.insert_one(user_doc)
    await log_event(str(result.inserted_id), "signup_doctor", "user", str(result.inserted_id))
    return {"message": "Doctor created"}


# ---------------- RUN SERVER ----------------

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
