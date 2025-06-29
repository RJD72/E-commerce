const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Authentication & Account Info
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    isVerified: { type: Boolean, default: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    status: { type: String, enum: ["active", "suspended"], default: "active" },

    // Personal Info
    firstName: { type: String },
    lastName: { type: String },
    phone: { type: String },
    profileImage: {
      type: String,
      default:
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
    },

    // Shipping & Billing Addresses
    shippingAddress: {
      street: { type: String },
      city: { type: String },
      province: { type: String },
      postalCode: { type: String },
      country: { type: String, default: "Canada" },
    },
    billingAddress: {
      street: { type: String },
      city: { type: String },
      province: { type: String },
      postalCode: { type: String },
      country: { type: String, default: "Canada" },
    },

    // Cart & Orders
    cart: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, required: true, default: 1 },
      },
    ],
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],

    //  Wishlist
    wishList: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        dateAdded: { type: Date, default: Date.now },
      },
    ],

    // Timestamps & Password Reset
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
