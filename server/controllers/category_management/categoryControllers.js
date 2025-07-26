const Category = require("../../models/categoryModel");
const Product = require("../../models/productModel"); // For dependency check
const { asyncHandler } = require("../../middleware/asyncHandler");
const mongoose = require("mongoose");

// @desc    Create a new category
// @route   POST /api/categories
// @access  Admin
exports.createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;

  const normalizedName = name.trim().toLowerCase();

  // Check if category already exists
  const categoryExists = await Category.findOne({
    name: { $regex: `^${name}$`, $options: "i" },
  });
  if (categoryExists) {
    return res.status(400).json({ message: "Category already exists" });
  }

  const category = await Category.create({ name: normalizedName });
  res.status(201).json(category);
});

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getAllCategories = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit);

  let categories;

  if (limit && !isNaN(limit)) {
    // Return 'limit' number of random categories
    categories = await Category.aggregate([{ $sample: { size: limit } }]);
  } else {
    categories = await Category.find().sort({ name: 1 }).lean();
  }
  res.status(200).json(categories);
});

// @desc    Get a single category by ID
// @route   GET /api/categories/:id
// @access  Public
exports.getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id).lean();
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }
  res.status(200).json(category);
});

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Admin
exports.updateCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const category = await Category.findById(req.params.id);

  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  // Optionally update fields
  if (name) category.name = name;

  const updatedCategory = await category.save();
  res.status(200).json(updatedCategory);
});

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Admin
exports.deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid category ID" });
  }

  const category = await Category.findById(id);

  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  // Check if products are using this category
  const productUsingCategory = await Product.findOne({
    category: id,
  });
  if (productUsingCategory) {
    return res.status(400).json({
      message: "Cannot delete category: Products are assigned to this category",
    });
  }

  await category.deleteOne({ _id: id });
  res.status(200).json({ message: "Category successfully deleted" });
});

// @desc    Get all products in a category
// @route   GET /api/categories/:id/products
// @access  Public
exports.getProductsByCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;

  // Sorting
  const sortBy = req.query.sortBy || "createdAt";
  const sortOrder = req.query.order === "desc" ? -1 : 1;
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder;

  // Query
  const [products, totalProducts] = await Promise.all([
    Product.find({ category: req.params.id })
      .populate("category")
      .sort(sortOptions)
      .skip(skip)
      .limit(limit),
    Product.countDocuments({ category: req.params.id }),
  ]);

  res.status(200).json({
    products,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
      totalProducts,
      productsPerPage: limit,
    },
    category: {
      name: category.name,
      _id: category._id,
    },
  });
});
