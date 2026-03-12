const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
const { login, signup, getCurrentUser } = require("../controllers/authController");

router.post("/login", login);
router.post("/signup", signup);
router.get("/me", authMiddleware, getCurrentUser);

module.exports = router;