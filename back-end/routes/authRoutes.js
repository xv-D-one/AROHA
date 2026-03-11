const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const { login, getCurrentUser } = require("../controllers/authController");

router.post("/login", login);
router.get("/me", authMiddleware, getCurrentUser);

module.exports = router;