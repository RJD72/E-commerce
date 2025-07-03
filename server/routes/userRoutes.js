const router = require("express").Router();
const {
  getUser,
  updateUser,
} = require("../controllers/user_management/userController");
const { authenticate } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

router
  .route("/profile")
  .get(authenticate, getUser)
  .patch(authenticate, upload.single("profileImage"), updateUser);

module.exports = router;
