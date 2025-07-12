const { asyncHandler } = require("../../middleware/asyncHandler");
const User = require("../../models/userModels"); // Mongoose model for the User
const Order = require("../../models/orderModel");
const sendEmail = require("../../utils/email"); // Utility function to send emails
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { formidable } = require("formidable"); // Parses multipart/form-data (used for file uploads + form fields)
const xss = require("xss"); // Sanitizes strings to prevent cross-site scripting (XSS) attacks
const path = require("path"); // Helps resolve file and directory paths
const { updateUserSchema } = require("../../joiSchemas/authSchema"); // Joi validation schema for updating users
const cloudinary = require("../../utils/cloudinary");

// @desc    Update user profile including addresses
// @route   PATCH /api/users/profile
// @access  Private
exports.updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: "User not found" });

  // Sanitize base text inputs
  const updates = {
    firstName: xss(req.body.firstName || ""),
    lastName: xss(req.body.lastName || ""),
    email: xss(req.body.email || ""),
    phone: xss(req.body.phone || ""),
  };

  // Sanitize and structure shipping address
  updates.shippingAddress = {
    street: xss(req.body.shippingStreet || ""),
    city: xss(req.body.shippingCity || ""),
    province: xss(req.body.shippingProvince || ""),
    postalCode: xss(req.body.shippingPostalCode || ""),
    country: xss(req.body.shippingCountry || "Canada"),
  };

  // Sanitize and structure billing address
  updates.billingAddress = {
    street: xss(req.body.billingStreet || ""),
    city: xss(req.body.billingCity || ""),
    province: xss(req.body.billingProvince || ""),
    postalCode: xss(req.body.billingPostalCode || ""),
    country: xss(req.body.billingCountry || "Canada"),
  };

  // If an image is included, upload and update profileImage
  if (req.file) {
    const prevImageUrl = user.profileImage;
    const defaultImage =
      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

    if (prevImageUrl && !prevImageUrl.includes("pixabay")) {
      const publicId = prevImageUrl.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`profile_pictures/${publicId}`);
    }

    const uploadResult = await cloudinary.uploader.upload_stream(
      {
        folder: "profile_pictures",
        resource_type: "image",
      },
      async (error, result) => {
        if (error) {
          return res
            .status(500)
            .json({ message: "Image upload failed", error });
        }

        updates.profileImage = result.secure_url;

        const updatedUser = await User.findByIdAndUpdate(
          req.user._id,
          updates,
          {
            new: true,
          }
        );

        return res.status(200).json({
          message: "User successfully updated!",
          user: updatedUser,
        });
      }
    );

    return require("streamifier")
      .createReadStream(req.file.buffer)
      .pipe(uploadResult);
  }

  // Standard update (no image)
  const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
  });

  res.status(200).json({
    message: "User successfully updated!",
    user: updatedUser,
  });
});

// @desc    Get logged-in user's profile + their order history
// @route   GET /api/users/profile
// @access  Private
exports.getUser = asyncHandler(async (req, res) => {
  // Find the user by the ID embedded in their JWT (req.user is set by the authenticate middleware)
  const user = await User.findById(req.user._id).select("-password");

  // If the user is found, also fetch their orders from the Order collection
  if (user) {
    // Find all orders associated with this user
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    // Respond with both the user profile and their orders
    res.status(200).json({
      user,
      orders,
    });
  } else {
    // If no user is found, return a 404 error
    res.status(404);
    throw new Error("User not found");
  }
});
