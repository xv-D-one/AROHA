const express = require("express");
const { createRecord, getPatientRecords } = require("../controllers/recordController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Apply authMiddleware to protect all record routes
router.use(authMiddleware);

// POST /api/records - Create a new medical record
router.post("/", createRecord);

// GET /api/records - Get all medical records for the logged-in patient
router.get("/", getPatientRecords);

module.exports = router;
