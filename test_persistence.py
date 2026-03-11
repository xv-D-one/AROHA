import asyncio
from db import db
from models import Role

async def verify():
    print("🔍 Verifying Data Integrity...")
    
    collections = [
        "users", "patients", "doctors", "reports", 
        "doctor_patient_assignments", "report_analysis", "audit_logs"
    ]
    
    all_passed = True
    
    for coll in collections:
        count = await db[coll].count_documents({})
        status = "✅" if count > 0 else "❌"
        if count == 0 and coll != "audit_logs": # Audit logs might be empty if no actions taken yet
             all_passed = False
        print(f" {status} Collection '{coll}': {count} documents")

    # Deep check: Ensure every user with PATIENT role has a matching document in patients collection
    users = await db.users.find({"role": Role.PATIENT.value}).to_list(length=None)
    for u in users:
        p = await db.patients.find_one({"user_id": str(u["_id"])})
        if not p:
            print(f" ❌ Integrity Error: User {u['email']} has no matching Patient profile!")
            all_passed = False
    
    if all_passed:
        print("\n✨ ALL INTEGRITY CHECKS PASSED!")
    else:
        print("\n⚠️ SOME CHECKS FAILED. Check cross-collection linking.")

if __name__ == "__main__":
    asyncio.run(verify())
