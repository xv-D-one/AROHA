const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const roleMiddleware = require("../middleware/roleMiddleware");

const { createUser } = require("../controllers/userController");

router.post(
  "/create",
  authMiddleware,
  roleMiddleware("ADMIN"),
  createUser
);

router.get("/profile", authMiddleware, (req, res) => {
  res.json({
    message: "Protected route accessed",
    user: req.user
  });
});

module.exports = router;