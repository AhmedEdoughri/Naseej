const express = require("express");
const router = express.Router();
const storesController = require("../controllers/storesController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.route("/").get(protect, storesController.getStores); // Admins and managers can see stores

router
  .route("/:id")
  .get(protect, storesController.getStoreById)
  .put(protect, authorize("admin"), storesController.updateStore) // Only admins can update
  .delete(protect, authorize("admin"), storesController.deleteStore); // Only admins can delete

module.exports = router;
