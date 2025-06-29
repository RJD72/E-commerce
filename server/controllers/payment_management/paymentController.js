// Import the Stripe library and your async error handler middleware
const Stripe = require("stripe");
// Initialize Stripe with your secret API key from environment variables
// This creates an instance of the Stripe client used to interact with the Stripe API
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const { asyncHandler } = require("../../middleware/asyncHandler");

// @desc    Create Stripe payment intent
// @route   POST /api/payments/create-intent
// @access  Private (requires user to be authenticated)
exports.createPaymentIntent = asyncHandler(async (req, res) => {
  // Destructure the amount to charge from the request body
  // Stripe expects the amount in the smallest currency unit (e.g., cents for CAD/USD)
  const { amount } = req.body;

  // If no amount is provided, return an error response
  if (!amount) {
    return res.status(400).json({ message: "Amount is required" });
  }

  // Create a new PaymentIntent on Stripe
  // A PaymentIntent represents your intent to collect payment and is used to securely handle the payment process
  const paymentIntent = await stripe.paymentIntents.create({
    amount, // Total charge amount in cents (e.g., 1999 = $19.99)
    currency: "cad", // Currency to charge in, e.g., CAD for Canadian dollars
    payment_method_types: ["card"], // Limit accepted methods to cards (Stripe default)
  });

  // Respond to the frontend with the client secret
  // The frontend will use this client secret to complete the payment with Stripe.js
  res.status(200).json({
    clientSecret: paymentIntent.client_secret,
  });
});

/**
 * @route   POST /api/stripe/webhook
 * @desc    Handle Stripe webhook events (payment success/failure)
 * @access  Public (Stripe calls this via HTTP)
 *
 * Workflow:
 * 1. Stripe sends an event to this endpoint with a signature
 * 2. We verify the event came from Stripe using the webhook secret
 * 3. Process the event based on type (e.g., payment success)
 * 4. Update our database and handle business logic
 * 5. Acknowledge receipt to Stripe
 */
exports.stripeWebhook = asyncHandler(async (req, res) => {
  // 1. Extract Stripe signature from headers
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    // 2. Verify the event is genuinely from Stripe
    event = stripe.webhooks.constructEvent(
      req.body, // Raw body buffer (thanks to express.raw())
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("⚠️ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // 3. Handle specific event types
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;

      // 3a. Check if we've already processed this event (idempotency)
      const existingOrder = await Order.findOne({
        paymentIntentId: paymentIntent.id,
      });

      if (existingOrder && existingOrder.status === "paid") {
        console.log(`Order ${existingOrder._id} already processed`);
        return res.status(200).json({ received: true });
      }

      // 3b. Update order status in database
      try {
        const updatedOrder = await Order.findOneAndUpdate(
          { paymentIntentId: paymentIntent.id },
          {
            status: "paid",
            paymentDetails: {
              amount: paymentIntent.amount / 100, // Convert cents to dollars
              currency: paymentIntent.currency,
              paymentMethod: paymentIntent.payment_method_types[0],
            },
          },
          { new: true }
        );

        if (!updatedOrder) {
          console.error(
            "❌ Order not found for PaymentIntent:",
            paymentIntent.id
          );
          // In production, consider a retry queue or admin alert
        } else {
          console.log(`💰 Order ${updatedOrder._id} marked as paid`);
          // 3c. Trigger fulfillment (email, shipping, etc.)
          // sendOrderConfirmationEmail(updatedOrder);
        }
      } catch (dbError) {
        console.error("❌ Database update failed:", dbError);
        // In production: Queue for retry or notify admin
      }
      break;

    case "payment_intent.payment_failed":
      const failedIntent = event.data.object;
      console.error(
        "❌ Payment failed:",
        failedIntent.last_payment_error?.message
      );

      // Optional: Notify user or admin
      // sendPaymentFailedNotification(failedIntent.metadata.userId);
      break;

    // Handle other relevant events
    case "charge.refunded":
      console.log("🔙 Refund processed:", event.data.object.id);
      // Update order status to "refunded"
      break;

    default:
      console.log(`⚡ Unhandled event type: ${event.type}`);
  }

  // 4. Acknowledge receipt to Stripe
  res.status(200).json({ received: true });
});

/**
 * @desc Issue a refund for a Stripe PaymentIntent
 * @route POST /api/payments/refund
 * @access Private/Admin
 */
exports.refundPayment = asyncHandler(async (req, res) => {
  const { paymentIntentId } = req.body;

  if (!paymentIntentId) {
    return res.status(400).json({ message: "PaymentIntent ID is required" });
  }

  try {
    // Create a refund for the given PaymentIntent
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
    });

    // Respond with Stripe refund object
    res.status(200).json({
      message: "Refund initiated successfully",
      refund,
    });
  } catch (error) {
    console.error("Refund failed:", error.message);
    res.status(500).json({ message: "Refund failed", error: error.message });
  }
});
