const router = require("express").Router();

const {
  createPaymentIntent,
  stripeWebhook,
  refundPayment,
  createStripeCheckoutSession,
} = require("../controllers/payment_management/paymentController");
const {
  authorizeAdmin,
  authenticate,
} = require("../middleware/authMiddleware");

// POST /api/payments/create-intent
// This endpoint creates a Stripe PaymentIntent and returns a clientSecret
router.post(
  "/create-checkout-session",
  authenticate,
  createStripeCheckoutSession
);
router.post("/webhook", stripeWebhook);
router.post("/refund", authenticate, authorizeAdmin, refundPayment);

module.exports = router;
