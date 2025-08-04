const Order = require("../../models/orderModel");
const User = require("../../models/userModels");
const Product = require("../../models/productModel");
const { asyncHandler } = require("../../middleware/asyncHandler");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const generateReceipt = require("../../utils/generateReceipt");
const nodemailer = require("nodemailer");
const path = require("path");

// @desc    Get order history for the logged-in user
// @route   GET /api/orders/my-orders
// @access  Private
exports.getUserOrders = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Fetch orders where user matches and populate product info
  const orders = await Order.find({ user: userId })
    .populate("items.product", "name price images")
    .sort({ createdAt: -1 }); // Show most recent first

  res.status(200).json(orders);
});

// @desc    Create new order after Stripe payment
// @route   POST /api/orders
// @access  Private
exports.createOrder = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const {
    items,
    shippingAddress,
    paymentMethod,
    totalAmount,
    paymentIntentId,
  } = req.body;

  if (
    !items?.length ||
    !shippingAddress ||
    !paymentMethod ||
    !totalAmount ||
    !paymentIntentId
  ) {
    return res.status(400).json({ message: "Missing order details." });
  }

  // Verify payment
  const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
  if (!intent || intent.status !== "succeeded") {
    return res.status(400).json({ message: "Payment not completed." });
  }

  // Check stock and update inventory
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }
    if (product.stock < item.quantity) {
      return res
        .status(400)
        .json({ message: `Not enough stock for ${product.name}` });
    }
    product.stock -= item.quantity;
    await product.save();
  }

  // Create order
  const order = await Order.create({
    user: userId,
    items,
    shippingAddress,
    paymentMethod,
    totalAmount,
    isPaid: true,
    paidAt: new Date(),
    status: "paid",
  });

  // Link order to user
  const user = await User.findById(userId);
  user.orders.push(order._id);
  await user.save();

  // Create PDF receipt
  const receiptPath = path.join(
    __dirname,
    `../receipts/order-${order._id}.pdf`
  );
  generateReceipt(order, receiptPath);

  // Send confirmation to user
  await transporter.sendMail({
    from: `"Your Store" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: "Order Confirmation",
    html: `<h3>Thanks for your order!</h3><p>Your order ID is <strong>${order._id}</strong>.</p>`,
    attachments: [{ filename: "receipt.pdf", path: receiptPath }],
  });

  // Notify admin
  await transporter.sendMail({
    from: `"Your Store" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: "New Order Placed",
    html: `<p>User ${user.email} placed an order. Order ID: <strong>${order._id}</strong></p>`,
  });

  res.status(201).json({ message: "Order placed successfully", order });
});

// @desc    Get a specific order by ID for the logged-in user
// @route   GET /api/orders/:id
// @access  Private
exports.getSingleOrder = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const orderId = req.params.id;

  const order = await Order.findById(orderId)
    .populate("items.product", "name price images reviews")
    .populate("user", "firstName lastName email");

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  if (order.user._id.toString() !== userId.toString()) {
    return res
      .status(403)
      .json({ message: "Not authorized to view this order" });
  }

  res.status(200).json(order);
});
