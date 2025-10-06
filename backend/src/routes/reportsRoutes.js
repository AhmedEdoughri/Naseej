const express = require("express");
const router = express.Router();
const reportsController = require("../controllers/reportsController");
const { protect, authorize } = require("../middleware/authMiddleware");

router
  .route("/requests")
  .get(
    protect,
    authorize("admin", "manager"),
    reportsController.getRequestsReport
  );

module.exports = router;
