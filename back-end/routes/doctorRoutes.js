const express = require("express");
const router = express.Router();
const Patient = require("../models/Patient");

router.get("/doctors/:doctorId/patients", async (req, res) => {
  try {
    const doctorId = req.params.doctorId;

    const patients = await Patient.find({
      doctorAssigned: doctorId
    });

    res.json(patients);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;