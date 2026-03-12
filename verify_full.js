const fs = require('fs');

async function runVerification() {
  const BASE_URL = "http://localhost:5000/api";
  
  try {
    // 1. Login as Admin
    console.log("Logging in as Admin...");
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'testadmin@aroha.com', password: 'Admin@123', role: 'admin' })
    });
    
    if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.status}`);
    const { token } = await loginRes.json();
    console.log("Admin Logged In!");

    // 2. Create Patient
    console.log("Creating patient...");
    const patientData = {
      name: "Persistence Test Patient",
      email: `test_${Date.now()}@example.com`,
      phone: "1234567890",
      age: 34,
      gender: "Male",
      bloodGroup: "O+",
      address: "123 Test St",
      doctorAssigned: "Dr. Arjun Pillai",
      emergencyContact: {
        name: "Emergency Contact",
        phone: "9876543210",
        relation: "Relative"
      },
      password: "password123"
    };

    const createPatRes = await fetch(`${BASE_URL}/patients`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(patientData)
    });

    if (!createPatRes.ok) throw new Error(`Patient creation failed: ${createPatRes.status} ${await createPatRes.text()}`);
    const newPatient = await createPatRes.json();
    console.log(`Patient Created: ${newPatient.name} (ID: ${newPatient._id})`);

    // 3. Verify Persistence (Fetch All Patients)
    console.log("Verifying persistence...");
    const listPatRes = await fetch(`${BASE_URL}/patients`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const patients = await listPatRes.json();
    const found = patients.find(p => p.email === patientData.email);
    if (found) {
      console.log("✅ Patient persistence verified in database!");
    } else {
      console.error("❌ Patient not found in list!");
    }

    // 4. Test Doctor Notes
    console.log("Logging in as Doctor...");
    const docLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'testdoctor@aroha.com', password: 'Admin@123', role: 'doctor' })
    });
    const { token: docToken } = await docLoginRes.json();

    console.log("Creating clinical note...");
    const noteData = {
      patientId: newPatient._id,
      patientName: newPatient.name,
      doctorId: "D-001",
      note: "Verification note: Persistence is working.",
      pinned: true
    };

    const createNoteRes = await fetch(`${BASE_URL}/notes`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${docToken}`
      },
      body: JSON.stringify(noteData)
    });

    const newNote = await createNoteRes.json();
    console.log(`Note Created: ${newNote.note}`);

    // Verify Note Persistence
    const listNoteRes = await fetch(`${BASE_URL}/notes`, {
      headers: { 'Authorization': `Bearer ${docToken}` }
    });
    const notesArr = await listNoteRes.json();
    const noteFound = (Array.isArray(notesArr) ? notesArr : []).find(n => n.note === noteData.note);
    if (noteFound) {
      console.log("✅ Doctor Note persistence verified!");
    } else {
      console.error("❌ Note not found in list!");
    }

  } catch (err) {
    console.error("Verification failed:", err.message);
  }
}

runVerification();
