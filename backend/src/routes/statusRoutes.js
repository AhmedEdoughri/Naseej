const express = require("express");
const router = express.Router();
const statusController = require("../controllers/statusController");
const { protect, authorize } = require("../middleware/authMiddleware");

// This route is now public and does not require authentication
router.route("/").get(statusController.getStatuses);

// All routes below this line are protected and for admins only
router.use(protect, authorize("admin"));

router.route("/reorder").put(statusController.reorderStatuses);

router.route("/").post(statusController.createStatus);

router
  .route("/:id")
  .put(statusController.updateStatus)
  .delete(statusController.deleteStatus);

module.exports = router;
