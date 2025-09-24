const express = require("express");
const router = express.Router();
const reportsController = require("../controllers/reportsController");
const { protect, authorize } = require("../middleware/authMiddleware");

router
  .route("/pickup-requests")
  .get(
    protect,
    authorize("admin", "manager"),
    reportsController.getPickupRequestsReport
  );

module.exports = router;
