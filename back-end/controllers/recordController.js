const Record = require("../models/Record");

// Create a new record
exports.createRecord = async (req, res) => {
  try {
    const {
      title,
      type,
      doctor,
      severity,
      aiSummary,
      attachments,
      tags,
      icon,
      color,
    } = req.body;

    const newRecord = new Record({
      patientId: req.user.id,
      title,
      type: type || "Analyzed Report",
      doctor,
      severity: severity || "Normal",
      aiSummary: aiSummary || "",
      attachments: attachments || [],
      tags: tags || [],
      icon: icon || "🤖",
      color: color || "#10b981",
    });

    const savedRecord = await newRecord.save();
    res.status(201).json(savedRecord);
  } catch (error) {
    console.error("Error creating record:", error);
    res.status(500).json({ message: "Server error creating record", error: error.message });
  }
};

// Get all records for a patient
exports.getPatientRecords = async (req, res) => {
  try {
    const records = await Record.find({ patientId: req.user.id }).sort({ date: -1 });
    res.status(200).json(records);
  } catch (error) {
    console.error("Error fetching patient records:", error);
    res.status(500).json({ message: "Server error fetching records", error: error.message });
  }
};
