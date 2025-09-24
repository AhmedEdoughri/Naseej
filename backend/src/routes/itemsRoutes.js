const express = require("express");
const router = express.Router();
const itemsController = require("../controllers/itemsController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.route("/").get(protect, itemsController.getItems);

router.route("/:id/status").patch(protect, itemsController.updateItemStatus);

router
  .route("/:id/assign")
  .patch(protect, authorize("admin", "manager"), itemsController.assignItem);

module.exports = router;
