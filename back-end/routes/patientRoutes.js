const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getPatients, createPatient, updatePatient, deletePatient, updatePatientStatus } = require("../controllers/patientController");

router.get("/", authMiddleware, getPatients);
router.post("/", authMiddleware, createPatient);
router.put("/:id", authMiddleware, updatePatient);
router.delete("/:id", authMiddleware, deletePatient);
router.patch("/:id/status", authMiddleware, updatePatientStatus);

module.exports = router;
