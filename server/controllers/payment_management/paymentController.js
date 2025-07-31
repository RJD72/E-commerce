// Import the Stripe library and your async error handler middleware
// Initialize Stripe with your secret API key from environment variables
// This creates an instance of the Stripe client used to interact with the Stripe API
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const User = require("../../models/userModels");
const Order = require("../../models/orderModel");

const { asyncHandler } = require("../../middleware/asyncHandler");

// @desc    Create Stripe payment intent
// @route   POST /api/payments/create-intent
// @access  Private (requires user to be authenticated)
// exports.createPaymentIntent = asyncHandler(async (req, res) => {
//   // Destructure the amount to charge from the request body
//   // Stripe expects the amount in the smallest currency unit (e.g., cents for CAD/USD)
//   const { amount } = req.body;

//   // If no amount is provided, return an error response
//   if (!amount) {
//     return res.status(400).json({ message: "Amount is required" });
//   }

//   // Create a new PaymentIntent on Stripe
//   // A PaymentIntent represents your intent to collect payment and is used to securely handle the payment process
//   const paymentIntent = await stripe.paymentIntents.create({
//     amount, // Total charge amount in cents (e.g., 1999 = $19.99)
//     currency: "cad", // Currency to charge in, e.g., CAD for Canadian dollars
//     payment_method_types: ["card"], // Limit accepted methods to cards (Stripe default)
//   });

//   // Respond to the frontend with the client secret
//   // The frontend will use this client secret to complete the payment with Stripe.js
//   res.status(200).json({
//     clientSecret: paymentIntent.client_secret,
//   });
// });

/**
 * @desc    Create Stripe Checkout Session
 * @route   POST /api/payments/create-checkout-session
 * @access  Private
 */
exports.createStripeCheckoutSession = asyncHandler(async (req, res) => {
  const { cartItems } = req.body;

  // Validate input
  if (!cartItems || !Array.isArray(cartItems)) {
    return res.status(400).json({ error: "Cart items are required" });
  }

  try {
    // Prepare line items
    const lineItems = cartItems.map((item) => {
      if (
        !item.productId ||
        !item.productId.name ||
        !item.productId.price ||
        !item.quantity
      ) {
        throw new Error(`Invalid product data: ${JSON.stringify(item)}`);
      }

      return {
        price_data: {
          currency: "cad",
          product_data: {
            name: item.productId.name,
            description: item.productId.description || undefined,
            images: item.productId.images
              ? [item.productId.images[0]]
              : undefined,
          },
          unit_amount: Math.round(item.productId.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      };
    });

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      customer_email: req.user.email,
      metadata: {
        environment: process.env.NODE_ENV || "development",
        userId: req.user?._id.toString() || "guest",
        cart: JSON.stringify(
          cartItems.map((item) => ({
            productId: item.productId._id || item.productId,
            quantity: item.quantity,
          }))
        ),
        shipping: JSON.stringify(req.user.shippingAddress),
      },
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cart`,
      shipping_address_collection: {
        allowed_countries: ["US", "CA"],
      },
      automatic_tax: {
        enabled: true,
      },
    });

    if (!session.url) {
      console.error("Stripe session has no URL", session);
      return res
        .status(500)
        .json({ error: "Stripe did not return a checkout URL" });
    }

    res.json({
      url: session.url,
    });
  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    res.status(500).json({
      error: "Failed to create checkout session",
      details: error.message,
    });
  }
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
  console.log("Webhook received - headers:", req.headers);
  console.log("Webhook received - body length:", req.body?.length);
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Webhook signature verification failed.", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const data = event.data.object;

  switch (event.type) {
    case "checkout.session.completed": {
      const metadata = data.metadata || {};
      const { userId, cart } = metadata;
      let shippingAddress = {};

      // Get shipping details from Stripe's shipping object if available
      if (data.shipping_details) {
        shippingAddress = {
          street: data.collected_information.shipping_details.address.line1,
          city: data.collected_information.shipping_details.address.city,
          province: data.collected_information.shipping_details.address.state,
          postalCode:
            data.collected_information.shipping_details.address.postal_code,
          country: data.collected_information.shipping_details.address.country,
        };
      } else {
        // Fallback to metadata if shipping_details isn't available
        try {
          shippingAddress = JSON.parse(metadata.shipping || "{}");
        } catch (e) {
          console.error("❌ Failed to parse shipping metadata:", e);
        }
      }

      // Validate required fields
      if (
        !shippingAddress.street ||
        !shippingAddress.city ||
        !shippingAddress.province ||
        !shippingAddress.postalCode
      ) {
        console.error("❌ Missing required shipping address fields");
        break;
      }

      if (!userId || !cart) {
        console.error("❌ Missing metadata in checkout.session.completed");
        break;
      }

      // let cartItems, shippingAddress;
      // try {
      //   cartItems = JSON.parse(cart);
      //   shippingAddress = JSON.parse(shipping);
      // } catch (e) {
      //   console.error("❌ Failed to parse metadata JSON:", e);
      //   break;
      // }

      try {
        // Avoid duplicate order creation
        const existing = await Order.findOne({ sessionId: data.id });
        if (existing) break;

        const newOrder = await Order.create({
          user: userId,
          sessionId: data.id,
          items: cartItems.map((item) => ({
            product: item.productId,
            quantity: item.quantity,
          })),
          shippingAddress,
          totalAmount: data.amount_total / 100,
          status: "paid",
          paymentMethod: "stripe",
          isPaid: true,
          paidAt: new Date(),
        });

        // Clear the user's cart
        await User.findByIdAndUpdate(userId, { cart: [] });

        // Email receipt
        const html = `
          <h2>Thank you for your order!</h2>
          <p>Order ID: ${newOrder._id}</p>
          <p>Total Paid: $${newOrder.totalAmount.toFixed(2)}</p>
          <p>We'll notify you when your order ships.</p>
        `;
        await sendEmail(data.customer_email, "Order Confirmation", html);

        console.log(`✅ Order created + email sent for session: ${data.id}`);
      } catch (err) {
        console.error("❌ Order creation or email failed:", err);
      }

      break;
    }

    case "payment_intent.succeeded":
      console.log("✅ Payment succeeded:", data.id);
      break;

    case "payment_intent.payment_failed":
      console.warn("⚠️ Payment failed:", data.id);
      break;

    case "charge.refunded": {
      console.log("💸 Charge refunded:", data.id);
      try {
        const order = await Order.findOne({
          paymentIntentId: data.payment_intent,
        });
        if (order) {
          order.status = "refunded";
          await order.save();
          console.log(`✅ Order ${order._id} marked as refunded`);
        }
      } catch (err) {
        console.error("❌ Refund handling failed:", err);
      }
      break;
    }

    case "checkout.session.expired":
      console.log("⌛ Checkout session expired:", data.id);
      break;

    default:
      console.log(`📩 Unhandled event type: ${event.type}`);
  }

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
