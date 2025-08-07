const { asyncHandler } = require("../../middleware/asyncHandler");
const Order = require("../../models/orderModel");

exports.getMonthlySales = asyncHandler(async (req, res) => {
  const sales = await Order.aggregate([
    {
      $group: {
        _id: { $month: "$createdAt" },
        revenue: { $sum: "$totalAmount" },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  const formatted = sales.map((s) => ({
    month: new Date(0, s._id - 1).toLocaleString("default", { month: "short" }),
    revenue: s.revenue,
  }));

  res.json(formatted);
});

exports.getTopProducts = asyncHandler(async (req, res) => {
  const orders = await Order.aggregate([
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.product",
        totalSold: { $sum: "$items.quantity" },
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
    {
      $project: {
        name: "$product.name",
        sales: "$totalSold",
      },
    },
    { $sort: { sales: -1 } },
    { $limit: 5 },
  ]);

  res.json(orders);
});

exports.getOrderStatusStats = asyncHandler(async (req, res) => {
  const stats = await Order.aggregate([
    {
      $group: {
        _id: "$status",
        value: { $sum: 1 },
      },
    },
  ]);

  const formatted = stats.map((s) => ({
    name: s._id,
    value: s.value,
  }));

  res.json(formatted);
});

exports.getPaymentMethodStats = asyncHandler(async (req, res) => {
  const stats = await Order.aggregate([
    {
      $group: {
        _id: "$paymentMethod",
        value: { $sum: 1 },
      },
    },
  ]);

  const formatted = stats.map((s) => ({
    name: s._id,
    value: s.value,
  }));

  res.json(formatted);
});
