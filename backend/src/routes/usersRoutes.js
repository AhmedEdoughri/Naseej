const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const { protect, authorize } = require("../middleware/authMiddleware");

// This route allows admins and managers to get the list of users,
// but only admins can create non-customer users (e.g., workers, managers).
router
  .route("/")
  .get(protect, authorize("admin", "manager"), usersController.getUsers)
  .post(protect, authorize("admin"), usersController.createUser);

// --- THIS IS THE NEW ROUTE ---
// This route is specifically for an admin to create a new customer and their store.
router
  .route("/customer")
  .post(protect, authorize("admin"), usersController.createCustomer);

// These routes for managing individual users remain admin-only.
router
  .route("/:id")
  .delete(protect, authorize("admin"), usersController.deleteUser)
  .put(protect, authorize("admin"), usersController.updateUser);

router
  .route("/:id/approve")
  .patch(protect, authorize("admin"), usersController.approveUser);
router
  .route("/:id/deny")
  .delete(protect, authorize("admin"), usersController.denyRegistration);

router.get("/roles", protect, authorize("admin"), usersController.getRoles);

module.exports = router;
