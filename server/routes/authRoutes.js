const {
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resetPasswordWithToken,
  refreshToken,
  resendVerificationEmail,
} = require("../controllers/user_management/authController");
const { authenticate } = require("../middleware/authMiddleware");

const router = require("express").Router();

router.post("/register", registerUser);
router.get("/verify-email", verifyEmail);
router.post("/login", loginUser);
router.post("/logout", authenticate, logoutUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/resend-verification", resendVerificationEmail);
router.post("/refresh-token", refreshToken);

module.exports = router;
