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

// Define the updateUser controller function
exports.updateUser = asyncHandler(async (req, res) => {
  // Set up the formidable instance to parse incoming form data
  const form = formidable({
    multiples: false, // Only allow a single file per field
    uploadDir: path.join(__dirname, "../uploads"), // Temporarily save uploaded files to the /uploads directory
    keepExtensions: true, // Preserve the original file extension (e.g., .jpg, .png)
  });

  // Parse the incoming form request
  form.parse(req, async (err, fields, files) => {
    if (err) {
      // If parsing fails, return a 400 Bad Request
      console.error("Formidable error:", err);
      return res.status(400).json({ message: "Invalid form data" });
    }

    // Helper function to normalize form fields (convert single-item arrays to string values)
    const normalize = (val) => (Array.isArray(val) ? val[0] : val);

    // Sanitize all incoming fields using xss to prevent malicious script injection
    const normalizedFields = {};
    for (const key in fields) {
      const value = normalize(fields[key]); // Normalize single-item arrays
      normalizedFields[key] =
        typeof value === "string" ? xss(value.trim()) : value;
    }

    // Validate sanitized input using Joi schema
    const { error, value } = updateUserSchema.validate(normalizedFields);

    // If validation fails, respond with a 400 and detailed error messages
    if (error) {
      return res.status(400).json({
        message: "Validation failed",
        error: error.details.map((detail) => detail.message),
      });
    }

    // If a profile image was uploaded, process it
    if (files.profileImage) {
      // Get the correct filepath regardless of whether it's a single object or an array
      const imagePath = `/uploads/${path.basename(
        files.profileImage[0]?.filepath || files.profileImage.filepath
      )}`;

      // Add the image URL to the value object to be saved in the database
      value.profileImage = imagePath;
    }

    try {
      // Update the user in MongoDB using their authenticated ID
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id, // ID of the authenticated user (set by your authentication middleware)
        { $set: value }, // Fields to update (sanitized and validated)
        { new: true, runValidators: true } // Return the updated document and enforce schema rules
      );

      // If the user doesn't exist, return a 404 Not Found
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Respond with the updated user data
      res.status(200).json({
        message: "User successfully updated!",
        data: updatedUser,
      });
    } catch (error) {
      // Handle unexpected errors (e.g., database issues)
      console.error("Error updating user:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
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
