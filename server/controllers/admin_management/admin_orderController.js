const Order = require("../../models/orderModel");
const { asyncHandler } = require("../../middleware/asyncHandler");

// @desc    Admin fetches all orders with user info
// @route   GET /api/admin/orders
// @access  Private/Admin
exports.getAllOrdersAdmin = asyncHandler(async (req, res) => {
  const {
    sortBy = "createdAt",
    order = "desc",
    page = 1,
    limit = 10,
    search = "",
    status = "",
  } = req.query;

  const sortField = [
    "createdAt",
    "status",
    "isPaid",
    "deliveredAt",
    "_id",
  ].includes(sortBy)
    ? sortBy
    : "createdAt";
  const sortOrder = order === "asc" ? 1 : -1;

  const skip = (page - 1) * limit;

  const keywordFilter = search
    ? {
        $or: [
          { "user.firstName": { $regex: search, $options: "i" } },
          { "user.lastName": { $regex: search, $options: "i" } },
          { "user.email": { $regex: search, $options: "i" } },
        ],
      }
    : {};

  const statusFilter = status ? { status } : {};

  const matchStage = { $and: [keywordFilter, statusFilter] };

  const aggregate = Order.aggregate([
    { $match: {} }, // Mongoose requires an initial $match even if empty
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    { $match: matchStage },
    { $sort: { [sortField]: sortOrder } },
    { $skip: Number(skip) },
    { $limit: Number(limit) },
  ]);

  const total = await Order.countDocuments();

  const orders = await aggregate.exec();

  res.status(200).json({
    orders,
    page: Number(page),
    pages: Math.ceil(total / limit),
    total,
  });
});

// @desc    Admin fetches an order by its ID
// @route   GET /api/admin/orders/:id
// @access  Private/Admin
exports.getOrderByIdAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params; // Get order ID from route

  // Find order by ID and populate user info
  const order = await Order.findById(id)
    .populate("user", "firstName lastName email phone")
    .populate("items.product", "name price images");

  // If not found, return 404
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  // Return the full order object
  res.status(200).json(order);
});

// @desc    Admin updates the status of an order
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatusAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params; // Get order ID
  const { status } = req.body; // New status to apply

  // Valid statuses based on your order model
  const validStatuses = [
    "pending",
    "paid",
    "shipped",
    "delivered",
    "cancelled",
  ];

  // If status is missing or invalid, return a 400 error
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid or missing status value" });
  }

  // Find the order by ID
  const order = await Order.findById(id);

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  // Update the status
  order.status = status;

  // Auto-set `paidAt` and `deliveredAt` if appropriate
  if (status === "paid" && !order.paidAt) {
    order.isPaid = true;
    order.paidAt = new Date();
  }

  if (status === "delivered" && !order.deliveredAt) {
    order.deliveredAt = new Date();
  }

  // Save the changes
  const updated = await order.save();

  res.status(200).json({
    message: `Order status updated to ${status}`,
    order: updated,
  });
});
