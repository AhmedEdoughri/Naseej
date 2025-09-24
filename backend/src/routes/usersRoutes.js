const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const { protect, authorize } = require("../middleware/authMiddleware");

// All routes in this file are protected and for admins only
router.use(protect, authorize("admin"));

router
  .route("/")
  .get(usersController.getUsers)
  .post(usersController.createUser);

router
  .route("/:id")
  .delete(usersController.deleteUser)
  .put(usersController.updateUser);

router.route("/:id/approve").patch(usersController.approveUser);
router.route("/:id/deny").delete(usersController.denyRegistration);

router.get("/roles", usersController.getRoles);

module.exports = router;
