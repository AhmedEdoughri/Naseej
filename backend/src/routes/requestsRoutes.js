const express = require("express");
const router = express.Router();

// --- MODIFICATION: Import the new controller functions ---

const {
  createRequest,
  getRequests,
  cancelRequest,
  updateRequestNotes,
  approveRequest,
  rejectRequest,
  getOrderHistory,
} = require("../controllers/requestsController");

const { protect, authorize } = require("../middleware/authMiddleware");

router
  .route("/")
  .post(protect, authorize("customer"), createRequest)
  .get(protect, authorize("admin", "manager", "customer"), getRequests);

router
  .route("/:id/cancel")
  .put(protect, authorize("admin", "manager", "customer"), cancelRequest);

router
  .route("/:id/notes")
  .put(protect, authorize("admin", "manager", "customer"), updateRequestNotes);

// --- MODIFICATION: Add new routes for approval and rejection ---

// These routes are restricted to managers and admins only.

router
  .route("/:id/approve")
  .put(protect, authorize("admin", "manager"), approveRequest);

router
  .route("/:id/reject")
  .put(protect, authorize("admin", "manager"), rejectRequest);

router
  .route("/:id/dispatch")
  .put(protect, authorize("admin", "manager"), (req, res) =>
    updateRequestStatus(res, req.params.id, "Driver Dispatched")
  );

router
  .route("/:id/delivery")
  .put(protect, authorize("admin", "manager"), (req, res) =>
    updateRequestStatus(res, req.params.id, "Out for Delivery")
  );

// @desc    Get order history for users
// @route   GET /api/requests/history
// @access  Private (Customer, Manager, Admin)
router.get(
  "/history",
  protect,
  authorize("customer", "manager", "admin"),
  getOrderHistory
);

module.exports = router;
