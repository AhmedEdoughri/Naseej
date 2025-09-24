const express = require("express");
const router = express.Router();
const pickupsController = require("../controllers/pickupsController");
const { protect, authorize } = require("../middleware/authMiddleware");

router
  .route("/")
  .post(protect, authorize("customer"), pickupsController.createPickupRequest)
  .get(
    protect,
    authorize("admin", "manager", "customer"),
    pickupsController.getPickupRequests
  );

module.exports = router;
