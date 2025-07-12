const User = require("../../models/userModels");
const Order = require("../../models/orderModel");
const { asyncHandler } = require("../../middleware/asyncHandler");

// @desc    Admin deactivates (suspends) a user account
// @route   PUT /api/admin/users/:id/deactivate
// @access  Private/Admin
exports.toggleUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Find user by ID
  const user = await User.findById(id);

  // If user not found, return 404
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Prevent self-deactivation
  if (user._id.toString() === req.user._id.toString()) {
    return res
      .status(400)
      .json({ message: "Admins cannot deactivate their own account" });
  }

  // Set status to suspended if active and active if suspended
  user.status = user.status === "active" ? "suspended" : "active";

  // Save changes
  await user.save();

  res.status(200).json({
    message: `User account ${
      user.status === "active" ? "reactivated" : "suspended"
    } successfully`,
    newStatus: user.status,
  });
});

// @desc    Admin gets a list of all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = asyncHandler(async (req, res) => {
  // Destructure query parameters (default values provided)
  const {
    page = 1, // Current page (default: 1)
    limit = 10, // Users per page (default: 10)
    sort = "-createdAt", // Sort field (-desc, +asc) (default: newest first)
    status = "", // Filter by status (e.g., 'active', 'suspended')
    search = "", // Search term for name/email
  } = req.query;

  // Build the query object for filtering
  const query = {};

  // Add status filter if provided
  if (status) {
    query.status = status;
  }

  // Add search filter (case-insensitive regex for name or email)
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  // Execute the query with pagination, sorting, and field exclusion
  const users = await User.find(query)
    .select("-password -__v") // Exclude sensitive/unnecessary fields
    .sort(sort) // Apply sorting (e.g., '-createdAt')
    .skip((page - 1) * limit) // Pagination: skip previous pages
    .limit(Number(limit)); // Convert limit to number

  // Get total count of users (for frontend pagination)
  const totalUsers = await User.countDocuments(query);

  // Return response with metadata
  res.status(200).json({
    success: true,
    data: users,
    pagination: {
      currentPage: Number(page),
      totalPages: Math.ceil(totalUsers / limit),
      totalUsers,
      usersPerPage: Number(limit),
    },
    filters: { status, search, sort }, // Optional: echo filters for frontend
  });
});

// @desc    Admin gets a single user's profile and their orders
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Find user by ID, excluding password
  const user = await User.findById(id).select("-password");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Populate user's order details
  const orders = await Order.find({ user: id })
    .select("createdAt status totalAmount") // Limit fields to what's needed
    .sort({ createdAt: -1 }); // Newest first

  res.status(200).json({
    user,
    orders,
  });
});
