const express = require("express");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/connectDB");
const cors = require("cors");
const bodyParser = require("body-parser");

require("dotenv").config();

const {
  stripeWebhook,
} = require("./controllers/payment_management/paymentController");

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const categoryRoutes = require("./routes/categoryRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

connectDB();

// Stripe webhook requires raw body
app.post(
  "/api/payments/webhook",
  bodyParser.raw({ type: "application/json" }),
  stripeWebhook
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: [
      "https://marketplacefront.netlify.app",
      "https://checkout.stripe.com",
    ],
    credentials: true, //✅ Needed for cookies/authorization headers
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/category", categoryRoutes);

app.get("/ping", (req, res) => {
  res.status(200).send("pong");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
