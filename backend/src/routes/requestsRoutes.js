const express = require("express");
const router = express.Router();
const requestsController = require("../controllers/requestsController");
const { protect, authorize } = require("../middleware/authMiddleware");

router
  .route("/")
  .post(protect, authorize("customer"), requestsController.createRequest)
  .get(
    protect,
    authorize("admin", "manager", "customer"),
    requestsController.getRequests
  );

module.exports = router;
