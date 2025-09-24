const express = require("express");
const router = express.Router();
const customersController = require("../controllers/customersController");
const { protect, authorize } = require("../middleware/authMiddleware");

// A manager or admin can view all customers
router
  .route("/")
  .get(
    protect,
    authorize("admin", "manager"),
    customersController.getCustomers
  );

// A manager or admin can create a new customer (e.g., for a direct delivery)
router
  .route("/")
  .post(
    protect,
    authorize("admin", "manager"),
    customersController.createCustomer
  );

// Only an admin can update or delete a customer's core details
router
  .route("/:id")
  .put(protect, authorize("admin"), customersController.updateCustomer)
  .delete(protect, authorize("admin"), customersController.deleteCustomer);

module.exports = router;
