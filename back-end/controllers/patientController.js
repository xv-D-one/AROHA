const Patient = require("../models/Patient");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Get all patients
exports.getPatients = async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new patient
exports.createPatient = async (req, res) => {
  try {
    const patientData = req.body;
    
    // Check if user already exists (if email provided)
    if (patientData.email) {
      const existingUser = await User.findOne({ email: patientData.email });
      if (existingUser) {
        return res.status(400).json({ message: "A user with this email already exists" });
      }
    }

    // Create user account if password provided
    if (patientData.password) {
      const hashedPassword = await bcrypt.hash(patientData.password, 10);
      await User.create({
        name: patientData.name,
        email: patientData.email,
        password: hashedPassword,
        role: "PATIENT"
      });
    }

    // Create patient record
    // Note: Hybrid mapping to support both legacy and new frontend fields
    const newPatient = new Patient({
      ...patientData,
      doctorAssigned: patientData.doctorAssigned || patientData.assignedDoctor,
      patientId: patientData.patientId || patientData.id || `P-${Date.now()}`
    });

    const savedPatient = await newPatient.save();
    res.status(201).json(savedPatient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update patient
exports.updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedPatient = await Patient.findOneAndUpdate(
      { patientId: id },
      req.body,
      { new: true }
    );
    if (!updatedPatient) return res.status(404).json({ message: "Patient not found" });
    res.json(updatedPatient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete patient
exports.deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findOneAndDelete({ patientId: id });
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    res.json({ message: "Patient deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update patient status
exports.updatePatientStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updatedPatient = await Patient.findOneAndUpdate(
      { patientId: id },
      { status },
      { new: true }
    );
    if (!updatedPatient) return res.status(404).json({ message: "Patient not found" });
    res.json(updatedPatient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};