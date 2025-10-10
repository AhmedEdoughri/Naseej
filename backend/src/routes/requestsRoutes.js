const express = require("express");
const router = express.Router();

const {
  createRequest,
  getRequests,
  cancelRequest,
  updateRequestNotes,
  approveRequest,
  rejectRequest,
  getOrderHistory,
  getRequestDetails,
  dispatchRequest, // Import the new function
  deliverRequest, // Import the new function
} = require("../controllers/requestsController");

const { protect, authorize } = require("../middleware/authMiddleware");

// --- Main Routes ---
router
  .route("/")
  .post(protect, authorize("customer"), createRequest)
  .get(protect, authorize("admin", "manager", "customer"), getRequests);

// --- CORRECTED ROUTE ORDER ---
// Specific routes MUST come before parameterized routes.
router.get(
  "/history",
  protect,
  authorize("customer", "manager", "admin"),
  getOrderHistory
);

router
  .route("/:id")
  .get(protect, authorize("admin", "manager", "customer"), getRequestDetails);

// --- Action Routes ---
router
  .route("/:id/cancel")
  .put(protect, authorize("admin", "manager", "customer"), cancelRequest);

router
  .route("/:id/notes")
  .patch(
    protect,
    authorize("admin", "manager", "customer"),
    updateRequestNotes
  ); // Note: PATCH is more appropriate here

router
  .route("/:id/approve")
  .put(protect, authorize("admin", "manager"), approveRequest);

router
  .route("/:id/reject")
  .put(protect, authorize("admin", "manager"), rejectRequest);

// CORRECTED: Using dedicated controller functions now
router
  .route("/:id/dispatch")
  .put(protect, authorize("admin", "manager"), dispatchRequest);

router
  .route("/:id/delivery")
  .put(protect, authorize("admin", "manager"), deliverRequest);

module.exports = router;
