const router = require("express").Router();
const {
  getUser,
  updateUser,
} = require("../controllers/user_management/userController");
const { authenticate } = require("../middleware/authMiddleware");

router
  .route("/profile")
  .get(authenticate, getUser)
  .patch(authenticate, updateUser);

module.exports = router;
