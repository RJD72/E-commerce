const Category = require("../../models/categoryModel");
const Product = require("../../models/productModel"); // For dependency check
const { asyncHandler } = require("../../middleware/asyncHandler");

// @desc    Create a new category
// @route   POST /api/categories
// @access  Admin
exports.createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  // Check if category already exists
  const categoryExists = await Category.findOne({ name });
  if (categoryExists) {
    return res.status(400).json({ message: "Category already exists" });
  }

  const category = await Category.create({ name, description });
  res.status(201).json(category);
});

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  res.status(200).json(categories);
});

// @desc    Get a single category by ID
// @route   GET /api/categories/:id
// @access  Public
exports.getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }
  res.status(200).json(category);
});

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Admin
exports.updateCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const category = await Category.findById(req.params.id);

  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  // Optionally update fields
  if (name) category.name = name;
  if (description) category.description = description;

  const updatedCategory = await category.save();
  res.status(200).json(updatedCategory);
});

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Admin
exports.deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  // Check if products are using this category
  const productUsingCategory = await Product.findOne({
    category: category.name,
  });
  if (productUsingCategory) {
    return res.status(400).json({
      message: "Cannot delete category: Products are assigned to this category",
    });
  }

  await category.remove();
  res.status(200).json({ message: "Category deleted" });
});
