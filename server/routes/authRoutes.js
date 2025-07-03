const {
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resetPasswordWithToken,
  refreshToken,
} = require("../controllers/user_management/authController");
const { authenticate } = require("../middleware/authMiddleware");

const router = require("express").Router();

router.post("/register", registerUser);
router.get("/verify-email", verifyEmail);
router.post("/login", loginUser);
router.post("/logout", authenticate, logoutUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/", authenticate, resetPassword);
router.post("/reset-password/:token", resetPasswordWithToken);
router.get("/refresh-token", refreshToken);

module.exports = router;
