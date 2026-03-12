/**
 * AROHA Back-End API Test Suite
 * Tests all endpoints: /api/auth/login, /api/auth/me,
 *                      /api/users/create, /api/users/profile
 * Run: node test_api.js
 */

require("dotenv").config({ override: true });

const BASE_URL = "http://localhost:5000";

// ─── Colours ────────────────────────────────────────────────────────────────
const G = "\x1b[32m", R = "\x1b[31m", Y = "\x1b[33m", C = "\x1b[36m", W = "\x1b[37m", RST = "\x1b[0m";
const pass = (msg) => console.log(`  ${G}✓ PASS${RST}  ${msg}`);
const fail = (msg, got, exp) => console.log(`  ${R}✗ FAIL${RST}  ${msg}\n         got:  ${JSON.stringify(got)}\n         exp:  ${JSON.stringify(exp)}`);
const section = (title) => console.log(`\n${C}━━━ ${title} ${RST}`);

let passed = 0, failed = 0;

function assert(label, condition, got, expected) {
  if (condition) { pass(label); passed++; }
  else { fail(label, got, expected); failed++; }
}

async function req(method, path, body, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  let json;
  try { json = await res.json(); } catch { json = {}; }
  return { status: res.status, body: json };
}

// ─── Test state ──────────────────────────────────────────────────────────────
const ADMIN_EMAIL = `test_admin_${Date.now()}@aroha.test`;
const DOCTOR_EMAIL = `test_doctor_${Date.now()}@aroha.test`;
const PATIENT_EMAIL = `test_patient_${Date.now()}@aroha.test`;
const PASSWORD = "Test@1234";
let adminToken, doctorToken, patientToken;
let createdAdminId, createdDoctorId, createdPatientId;

// ─── SUITE 1: Root ───────────────────────────────────────────────────────────
async function testRoot() {
  section("ROOT ENDPOINT");
  const res = await fetch(`${BASE_URL}/`);
  const text = await res.text();
  assert("GET / → 200 OK", res.status === 200, res.status, 200);
  assert("GET / → 'API Running'", text.includes("API Running"), text, "API Running");
}

// ─── SUITE 2: User Creation (Admin-only) ─────────────────────────────────────
async function testUserCreation() {
  section("POST /api/users/create");

  // Seed: need an ADMIN first — seed directly via DB to bootstrap
  const mongoose = require("mongoose");
  const User = require("./models/User");
  const bcrypt = require("bcryptjs");
  const jwt = require("jsonwebtoken");

  await mongoose.connect(process.env.MONGO_URI, { dbName: "hospitalDB" });

  // Clean up any leftover test users from previous runs
  await User.deleteMany({ email: { $in: [ADMIN_EMAIL, DOCTOR_EMAIL, PATIENT_EMAIL] } });

  // Create admin directly in DB (no route bootstrapping needed)
  const hash = await bcrypt.hash(PASSWORD, 10);
  const adminUser = await User.create({ name: "Test Admin", email: ADMIN_EMAIL, password: hash, role: "ADMIN" });
  createdAdminId = adminUser._id.toString();
  adminToken = jwt.sign({ id: adminUser._id, role: "ADMIN" }, process.env.JWT_SECRET, { expiresIn: "1d" });
  pass(`Admin seeded directly in DB: ${ADMIN_EMAIL}`); passed++;

  // ── Normal: ADMIN creates DOCTOR ──
  const r1 = await req("POST", "/api/users/create",
    { name: "Test Doctor", email: DOCTOR_EMAIL, password: PASSWORD, role: "DOCTOR" }, adminToken);
  assert("Admin creates DOCTOR → 201", r1.status === 201, r1.status, 201);
  assert("DOCTOR has correct role", r1.body.role === "DOCTOR", r1.body.role, "DOCTOR");
  assert("Password is hashed (not plaintext)", r1.body.password !== PASSWORD, r1.body.password, "<hashed>");
  if (r1.body._id) createdDoctorId = r1.body._id;

  // ── Normal: ADMIN creates PATIENT ──
  const r2 = await req("POST", "/api/users/create",
    { name: "Test Patient", email: PATIENT_EMAIL, password: PASSWORD, role: "PATIENT" }, adminToken);
  assert("Admin creates PATIENT → 201", r2.status === 201, r2.status, 201);
  assert("PATIENT has correct role", r2.body.role === "PATIENT", r2.body.role, "PATIENT");
  if (r2.body._id) createdPatientId = r2.body._id;

  // ── Edge: Duplicate email ──
  const r3 = await req("POST", "/api/users/create",
    { name: "Dup Doctor", email: DOCTOR_EMAIL, password: PASSWORD, role: "DOCTOR" }, adminToken);
  assert("Duplicate email → 400", r3.status === 400, r3.status, 400);
  assert("Duplicate email error message", r3.body.message?.includes("already exists"), r3.body.message, "User already exists");

  // ── Edge: No auth token ──
  const r4 = await req("POST", "/api/users/create",
    { name: "No Auth", email: "noauth@test.com", password: PASSWORD, role: "DOCTOR" });
  assert("No token → 401", r4.status === 401, r4.status, 401);

  // ── Edge: Wrong role (DOCTOR tries to create user) ──
  const doctorUser = await User.findOne({ email: DOCTOR_EMAIL });
  doctorToken = jwt.sign({ id: doctorUser._id, role: "DOCTOR" }, process.env.JWT_SECRET, { expiresIn: "1d" });
  const r5 = await req("POST", "/api/users/create",
    { name: "Sneaky", email: "sneaky@test.com", password: PASSWORD, role: "ADMIN" }, doctorToken);
  assert("DOCTOR cannot create user → 403", r5.status === 403, r5.status, 403);
  assert("403 returns 'Access denied'", r5.body.message === "Access denied", r5.body.message, "Access denied");

  // ── Edge: PATIENT tries to create user ──
  const patientUser = await User.findOne({ email: PATIENT_EMAIL });
  patientToken = jwt.sign({ id: patientUser._id, role: "PATIENT" }, process.env.JWT_SECRET, { expiresIn: "1d" });
  const r6 = await req("POST", "/api/users/create",
    { name: "Sneaky Patient", email: "snkpatient@test.com", password: PASSWORD, role: "ADMIN" }, patientToken);
  assert("PATIENT cannot create user → 403", r6.status === 403, r6.status, 403);

  // ── Edge: Missing required fields ──
  const r7 = await req("POST", "/api/users/create",
    { name: "No Email", password: PASSWORD, role: "DOCTOR" }, adminToken);
  assert("Missing email → 500 (Mongoose validation)", r7.status === 500, r7.status, 500);

  const r8 = await req("POST", "/api/users/create",
    { email: "noemail@test.com", password: PASSWORD, role: "DOCTOR" }, adminToken);
  assert("Missing name → 500 (Mongoose validation)", r8.status === 500, r8.status, 500);

  // ── Edge: Invalid role enum ──
  const r9 = await req("POST", "/api/users/create",
    { name: "Bad Role", email: `badrole_${Date.now()}@test.com`, password: PASSWORD, role: "NURSE" }, adminToken);
  assert("Invalid role enum → 500 (Mongoose validation)", r9.status === 500, r9.status, 500);

  // ── Edge: Invalid/expired token ──
  const r10 = await req("POST", "/api/users/create",
    { name: "Fake", email: "fake@test.com", password: PASSWORD, role: "DOCTOR" }, "invalid.token.here");
  assert("Invalid JWT → 401", r10.status === 401, r10.status, 401);

  // ── Edge: Malformed Authorization header ──
  const headers = { "Content-Type": "application/json", "Authorization": `Token ${adminToken}` }; // 'Token' not 'Bearer'
  const res11 = await fetch(`${BASE_URL}/api/users/create`, {
    method: "POST", headers,
    body: JSON.stringify({ name: "Malformed", email: "malformed@test.com", password: PASSWORD, role: "DOCTOR" })
  });
  const b11 = await res11.json();
  // Note: "Token eyJ..." header still extracts a valid JWT string via split(" ")[1].
  // Express 5 may return 400 or 401 depending on how it handles the jwt.verify error.
  assert("Malformed auth header (Token instead of Bearer) → 4xx", res11.status === 400 || res11.status === 401, res11.status, "400 or 401");

  await mongoose.disconnect();
}

// ─── SUITE 3: Login ──────────────────────────────────────────────────────────
async function testLogin() {
  section("POST /api/auth/login");

  // ── Normal: Admin login ──
  const r1 = await req("POST", "/api/auth/login", { email: ADMIN_EMAIL, password: PASSWORD });
  assert("Admin login → 200", r1.status === 200, r1.status, 200);
  assert("Login returns token", typeof r1.body.token === "string", typeof r1.body.token, "string");
  assert("Login returns user object", !!r1.body.user, r1.body.user, "object");
  assert("User role is ADMIN", r1.body.user?.role === "ADMIN", r1.body.user?.role, "ADMIN");
  assert("Password NOT returned in login response", !r1.body.user?.password, r1.body.user?.password, undefined);
  adminToken = r1.body.token; // refresh token

  // ── Normal: Doctor login ──
  const r2 = await req("POST", "/api/auth/login", { email: DOCTOR_EMAIL, password: PASSWORD });
  assert("Doctor login → 200", r2.status === 200, r2.status, 200);
  assert("Doctor token returned", typeof r2.body.token === "string", typeof r2.body.token, "string");
  doctorToken = r2.body.token;

  // ── Normal: Patient login ──
  const r3 = await req("POST", "/api/auth/login", { email: PATIENT_EMAIL, password: PASSWORD });
  assert("Patient login → 200", r3.status === 200, r3.status, 200);
  patientToken = r3.body.token;

  // ── Edge: Wrong password ──
  const r4 = await req("POST", "/api/auth/login", { email: ADMIN_EMAIL, password: "wrongpassword" });
  assert("Wrong password → 400", r4.status === 400, r4.status, 400);
  assert("Wrong password message", r4.body.message === "Invalid email or password", r4.body.message, "Invalid email or password");

  // ── Edge: Non-existent email ──
  const r5 = await req("POST", "/api/auth/login", { email: "nobody@nowhere.com", password: PASSWORD });
  assert("Non-existent email → 400", r5.status === 400, r5.status, 400);
  assert("Non-existent email message", r5.body.message === "Invalid email or password", r5.body.message, "Invalid email or password");

  // ── Security: Error message same for wrong email & wrong password (no enumeration) ──
  assert("Same error msg for wrong email vs wrong pass (prevents user enumeration)",
    r4.body.message === r5.body.message, r4.body.message, r5.body.message);

  // ── Edge: Empty body ──
  const r6 = await req("POST", "/api/auth/login", {});
  assert("Empty body login → 400", r6.status === 400, r6.status, 400);

  // ── Edge: Missing password ──
  const r7 = await req("POST", "/api/auth/login", { email: ADMIN_EMAIL });
  assert("Missing password → 400", r7.status === 400, r7.status, 400);

  // ── Edge: Missing email ──
  const r8 = await req("POST", "/api/auth/login", { password: PASSWORD });
  assert("Missing email → 400", r8.status === 400, r8.status, 400);

  // ── Edge: SQL-like injection attempt in email ──
  const r9 = await req("POST", "/api/auth/login", { email: "' OR '1'='1", password: PASSWORD });
  assert("SQL-like injection in email → 400 (not 500)", r9.status === 400, r9.status, 400);
}

// ─── SUITE 4: GET /api/auth/me ────────────────────────────────────────────────
async function testGetMe() {
  section("GET /api/auth/me");

  // ── Normal: Each role ──
  const r1 = await req("GET", "/api/auth/me", null, adminToken);
  assert("Admin GET /me → 200", r1.status === 200, r1.status, 200);
  assert("Returns name", typeof r1.body.name === "string", r1.body.name, "string");
  assert("Returns email", r1.body.email === ADMIN_EMAIL, r1.body.email, ADMIN_EMAIL);
  assert("Password NOT returned in /me", !r1.body.password, r1.body.password, undefined);
  assert("Role is ADMIN", r1.body.role === "ADMIN", r1.body.role, "ADMIN");

  const r2 = await req("GET", "/api/auth/me", null, doctorToken);
  assert("Doctor GET /me → 200", r2.status === 200, r2.status, 200);
  assert("Doctor role correct", r2.body.role === "DOCTOR", r2.body.role, "DOCTOR");

  const r3 = await req("GET", "/api/auth/me", null, patientToken);
  assert("Patient GET /me → 200", r3.status === 200, r3.status, 200);
  assert("Patient role correct", r3.body.role === "PATIENT", r3.body.role, "PATIENT");

  // ── Edge: No token ──
  const r4 = await req("GET", "/api/auth/me");
  assert("No token → 401", r4.status === 401, r4.status, 401);
  assert("No token message", r4.body.message === "No token provided", r4.body.message, "No token provided");

  // ── Edge: Invalid token ──
  const r5 = await req("GET", "/api/auth/me", null, "bad.token.value");
  assert("Invalid token → 401", r5.status === 401, r5.status, 401);
  assert("Invalid token message", r5.body.message === "Invalid token", r5.body.message, "Invalid token");

  // ── Edge: Expired token ──
  const jwt = require("jsonwebtoken");
  const expiredToken = jwt.sign({ id: "fakeid", role: "ADMIN" }, process.env.JWT_SECRET, { expiresIn: "-1s" });
  const r6 = await req("GET", "/api/auth/me", null, expiredToken);
  assert("Expired token → 401", r6.status === 401, r6.status, 401);

  // ── Edge: Token with manipulated role ──
  const tamperedToken = jwt.sign({ id: "fakeid", role: "SUPERUSER" }, "wrong-secret", { expiresIn: "1d" });
  const r7 = await req("GET", "/api/auth/me", null, tamperedToken);
  assert("Tampered secret → 401", r7.status === 401, r7.status, 401);
}

// ─── SUITE 5: GET /api/users/profile ─────────────────────────────────────────
async function testProfile() {
  section("GET /api/users/profile");

  const r1 = await req("GET", "/api/users/profile", null, adminToken);
  assert("Admin GET /profile → 200", r1.status === 200, r1.status, 200);
  assert("Profile returns user payload from JWT", !!r1.body.user, r1.body.user, "object");
  assert("Profile message correct", r1.body.message === "Protected route accessed", r1.body.message, "Protected route accessed");

  const r2 = await req("GET", "/api/users/profile", null, doctorToken);
  assert("Doctor GET /profile → 200", r2.status === 200, r2.status, 200);

  const r3 = await req("GET", "/api/users/profile", null, patientToken);
  assert("Patient GET /profile → 200", r3.status === 200, r3.status, 200);

  // ── Edge: No token ──
  const r4 = await req("GET", "/api/users/profile");
  assert("No token on /profile → 401", r4.status === 401, r4.status, 401);
}

// ─── SUITE 6: DB Integrity ───────────────────────────────────────────────────
async function testDBIntegrity() {
  section("DATABASE INTEGRITY");

  const mongoose = require("mongoose");
  const User = require("./models/User");
  const dns2 = require("dns");
  dns2.setDefaultResultOrder("ipv4first");
  dns2.setServers(["8.8.8.8", "8.8.4.4"]);

  await mongoose.connect(process.env.MONGO_URI, { dbName: "hospitalDB" });

  // ── Unique index on email ──
  const bcrypt = require("bcryptjs");
  const hash = await bcrypt.hash("Test@1234", 10);
  let dupErr;
  try {
    await User.create({ name: "Dup", email: ADMIN_EMAIL, password: hash, role: "DOCTOR" });
  } catch (e) { dupErr = e; }
  assert("MongoDB unique index rejects duplicate email", !!dupErr, null, "MongoServerError");
  assert("Error code is 11000 (duplicate key)", dupErr?.code === 11000, dupErr?.code, 11000);

  // ── Verify test users persist in DB ──
  const admin = await User.findOne({ email: ADMIN_EMAIL });
  const doctor = await User.findOne({ email: DOCTOR_EMAIL });
  const patient = await User.findOne({ email: PATIENT_EMAIL });
  assert("Admin user persists in DB", !!admin, !!admin, true);
  assert("Doctor user persists in DB", !!doctor, !!doctor, true);
  assert("Patient user persists in DB", !!patient, !!patient, true);

  // ── Role enum constraint ──
  let roleErr;
  try {
    await User.create({ name: "Bad", email: `enum_${Date.now()}@test.com`, password: hash, role: "INVALID" });
  } catch (e) { roleErr = e; }
  assert("Invalid role enum rejected by Mongoose", !!roleErr, null, "ValidationError");

  // ── Required field constraints ──
  let reqErr;
  try { await User.create({ email: `req_${Date.now()}@test.com`, password: hash, role: "DOCTOR" }); }
  catch (e) { reqErr = e; }
  assert("Missing 'name' rejected by Mongoose", !!reqErr, null, "ValidationError");

  // ── Timestamps present ──
  assert("createdAt timestamp exists on user", !!admin?.createdAt, !!admin?.createdAt, true);
  assert("updatedAt timestamp exists on user", !!admin?.updatedAt, !!admin?.updatedAt, true);

  // ── Clean up test users ──
  const { deletedCount } = await User.deleteMany({
    email: { $in: [ADMIN_EMAIL, DOCTOR_EMAIL, PATIENT_EMAIL] }
  });
  assert(`Cleanup: deleted ${deletedCount} test users`, deletedCount === 3, deletedCount, 3);

  await mongoose.disconnect();
}

// ─── Run all suites ───────────────────────────────────────────────────────────
(async () => {
  console.log(`\n${Y}╔══════════════════════════════════════════════╗${RST}`);
  console.log(`${Y}║       AROHA API & Database Test Suite        ║${RST}`);
  console.log(`${Y}╚══════════════════════════════════════════════╝${RST}`);
  console.log(`${W}  Server: ${BASE_URL}${RST}`);
  console.log(`${W}  Time:   ${new Date().toISOString()}${RST}`);

  try {
    await testRoot();
    await testUserCreation();
    await testLogin();
    await testGetMe();
    await testProfile();
    await testDBIntegrity();
  } catch (err) {
    console.error(`\n${R}Unexpected error in test runner:${RST}`, err.message);
    failed++;
  }

  // ── Summary ──
  const total = passed + failed;
  console.log(`\n${Y}━━━ RESULTS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RST}`);
  console.log(`  ${G}Passed: ${passed}/${total}${RST}`);
  if (failed > 0) {
    console.log(`  ${R}Failed: ${failed}/${total}${RST}`);
  } else {
    console.log(`  ${G}All tests passed! 🎉${RST}`);
  }
  console.log();
  process.exit(failed > 0 ? 1 : 0);
})();
