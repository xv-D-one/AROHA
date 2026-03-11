const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
patientId: {
type: String,
required: true,
unique: true
},

name: {
type: String,
required: true,
trim: true
},

age: {
type: Number,
required: true,
min: 0
},

gender: {
type: String,
enum: ["Male", "Female", "Other"],
required: true
},

bloodGroup: {
type: String,
enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
},

phone: {
type: String,
required: true
},

email: {
type: String
},

address: {
type: String
},

doctorAssigned: {
  type: String,
  required: true
},

emergencyContact: {
name: String,
phone: String,
relation: String
},

allergies: {
type: [String],
default: []
},

chronicDiseases: {
type: [String],
default: []
},

registeredDate: {
type: Date,
default: Date.now
},

lastVisit: {
type: Date
}

}, { timestamps: true });

module.exports = mongoose.model("Patient", patientSchema);
