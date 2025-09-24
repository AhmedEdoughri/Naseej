const express = require("express");
const router = express.Router();
const settingsController = require("../controllers/settingsController");
const { protect, authorize } = require("../middleware/authMiddleware");

// The GET route for settings is now public and accessible to everyone.
router.get("/", settingsController.getSettings);

// The PUT route for updating settings remains protected and admin-only.
router.put("/", protect, authorize("admin"), settingsController.updateSettings);

module.exports = router;
