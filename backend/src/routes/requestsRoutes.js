const express = require("express");
const router = express.Router();
const requestsController = require("../controllers/requestsController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Existing routes for creating and getting requests
router
  .route("/")
  .post(protect, authorize("customer"), requestsController.createRequest)
  .get(
    protect,
    authorize("admin", "manager", "customer"),
    requestsController.getRequests
  );

// New route for cancelling a request
router
  .route("/:id/cancel")
  .put(
    protect,
    authorize("admin", "manager", "customer"),
    requestsController.cancelRequest
  );

// New route for updating request notes
router
  .route("/:id/notes")
  .put(
    protect,
    authorize("admin", "manager", "customer"),
    requestsController.updateRequestNotes
  );

module.exports = router;
