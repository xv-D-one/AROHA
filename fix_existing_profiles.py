import asyncio
from uuid import uuid4
from datetime import datetime
from db import db
from models import Role

async def fix_profiles():
    print("🛠️ Retroactively creating missing profiles...")
    users = await db.users.find({}).to_list(length=None)
    
    fixed_count = 0
    for u in users:
        role = u.get("role")
        user_id_str = str(u["_id"])
        
        if role == Role.PATIENT.value:
            p = await db.patients.find_one({"user_id": user_id_str})
            if not p:
                patient_id = u.get("patient_id") or str(uuid4())
                await db.patients.insert_one({
                    "user_id": user_id_str,
                    "patient_id": patient_id,
                    "email": u["email"],
                    "created_at": datetime.utcnow()
                })
                # Ensure user doc has the patient_id too
                await db.users.update_one({"_id": u["_id"]}, {"$set": {"patient_id": patient_id}})
                print(f" - Fixed Patient profile for: {u['email']}")
                fixed_count += 1
                
        elif role == Role.DOCTOR.value:
            d = await db.doctors.find_one({"user_id": user_id_str})
            if not d:
                doctor_id = u.get("doctor_id") or str(uuid4())
                await db.doctors.insert_one({
                    "user_id": user_id_str,
                    "doctor_id": doctor_id,
                    "email": u["email"],
                    "created_at": datetime.utcnow()
                })
                # Ensure user doc has the doctor_id too
                await db.users.update_one({"_id": u["_id"]}, {"$set": {"doctor_id": doctor_id}})
                print(f" - Fixed Doctor profile for: {u['email']}")
                fixed_count += 1
                
    print(f"✅ Finished! {fixed_count} profiles retroactively created.")

if __name__ == "__main__":
    asyncio.run(fix_profiles())
