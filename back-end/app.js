require("dotenv").config({ override: true });
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");

const userRoutes = require("./routes/userRoutes");

const doctorRoutes = require("./routes/doctorRoutes");

const recordRoutes = require("./routes/recordRoutes");
const patientRoutes = require("./routes/patientRoutes");
const noteRoutes = require("./routes/noteRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api", doctorRoutes);
app.use("/api/records", recordRoutes);

app.get("/", (req, res) => {
  res.send("API Running");
});

module.exports = app;