const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true
  },
  doctorId: {
    type: String,
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  note: {
    type: String,
    required: true
  },
  pinned: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
    default: "#0ea5e9"
  },
  date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model("Note", noteSchema);
