require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");

const userRoutes = require("./routes/userRoutes");

const doctorRoutes = require("./routes/doctorRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api", doctorRoutes);

app.get("/", (req, res) => {
  res.send("API Running");
});

module.exports = app;