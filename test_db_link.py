import asyncio
import httpx
from db import db

async def test_flow():
    test_email = "test.patient@example.com"
    test_password = "password123"
    
    print("1. Hitting the Signup Endpoint...")
    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        # Simulate form data submission
        response = await client.post(
            "/signup_web",
            data={"email": test_email, "password": test_password, "role": "patient"},
            follow_redirects=False
        )
        print(f"Signup response status: {response.status_code}")
        
    print("\n2. Checking MongoDB specifically for the new user...")
    user = await db.users.find_one({"email": test_email})
    if user:
        print("✅ SUCCESS! The data is stored in the MongoDB Atlas database.")
        print("User Data Stored:")
        print(f" - ID: {user['_id']}")
        print(f" - Email: {user['email']}")
        print(f" - Role: {user['role']}")
        print(f" - Created At: {user['created_at']}")
        
        # Cleanup
        await db.users.delete_one({"_id": user["_id"]})
        print("\n(Test user cleaned up)")
    else:
        print("❌ FAILED! Could not find the user in the database.")

if __name__ == "__main__":
    import asyncio
    asyncio.run(test_flow())
