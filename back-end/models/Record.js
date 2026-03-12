const mongoose = require("mongoose");

const recordSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      default: "Analyzed Report",
    },
    date: {
      type: Date,
      default: Date.now,
    },
    doctor: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      default: "Normal",
    },
    aiSummary: {
      type: String,
      default: "",
    },
    attachments: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    icon: {
      type: String,
      default: "🤖",
    },
    color: {
      type: String,
      default: "#10b981",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Record", recordSchema);
