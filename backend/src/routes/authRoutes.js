const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/login", authController.login);
router.post("/register-store", authController.registerStore);
router.post("/forgot-password", authController.forgotPassword);

module.exports = router;
