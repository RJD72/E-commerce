const { formidable } = require("formidable"); // Middleware to handle multipart/form-data (file uploads + fields)
const xss = require("xss"); // To sanitize user input (prevent XSS)
const { asyncHandler } = require("../../middleware/asyncHandler");
const Product = require("../../models/productModel");
const {
  productSchema,
  productArraySchema,
} = require("../../joiSchemas/productSchema");
const { reviewSchema } = require("../../joiSchemas/reviewSchema");
const mongoose = require("mongoose");

// @desc    Get all products (optionally paginated and sorted)
// @route   GET /api/products
// @access  Public
exports.getAllProducts = asyncHandler(async (req, res) => {
  try {
    // --- STEP 1: Optional query parameters for pagination, sorting, etc. ---
    const page = parseInt(req.query.page) || 1; // default to page 1
    const limit = parseInt(req.query.limit) || 12; // default to 12 products per page
    const sortBy = req.query.sortBy || "createdAt"; // default sort field
    const order = req.query.order === "asc" ? 1 : -1; // ascending or descending

    const skip = (page - 1) * limit;

    // --- STEP 2: Fetch products from the database ---
    const products = await Product.find({})
      .populate("category") // populate related category info from referenced collection
      .skip(skip) // skip items for pagination
      .limit(limit) // limit items per page
      .sort({ [sortBy]: order }); // dynamic sort based on query

    // --- STEP 3: Get total count for pagination metadata ---
    const total = await Product.countDocuments();

    // --- STEP 4: Send JSON response with data and pagination info ---
    res.status(200).json({
      data: products,
      pagination: {
        totalItems: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        pageSize: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error.message);

    // Send a consistent server error response
    res.status(500).json({
      message: "Failed to fetch products. Please try again later.",
      error: error.message,
    });
  }
});

exports.getProductById = asyncHandler(async (req, res) => {
  try {
    // Attempt to find a product by its MongoDB _id from the request URL parameter
    const product = await Product.findById(req.params.id);

    if (product) {
      // If product is found, return it in the response
      return res.status(200).json({ data: product });
    } else {
      // If no product is found with that ID, return a 404 Not Found
      return res.status(404).json({ message: "Product not found." });
    }
  } catch (error) {
    // Handle errors such as invalid ObjectId format
    console.error("Error fetching product:", error);

    // Return a 500 Internal Server Error with a clear message
    return res.status(500).json({
      message: "Failed to retrieve product.",
    });
  }
});

// @desc    Search products with optional filters and pagination
// @route   GET /api/products/search
// @access  Public
exports.searchProducts = asyncHandler(async (req, res) => {
  // Destructure all possible query parameters from the request URL
  const {
    keyword,
    category,
    minPrice,
    maxPrice,
    brand,
    sortBy,
    order,
    page, // New: Page number parameter (defaults to 1)
    limit, // New: Number of items per page (defaults to 10)
  } = req.query;

  // Build dynamic query object that will be used for MongoDB filtering
  // This object will be populated based on the provided query parameters
  const query = {};

  // Keyword search (searching in name and description fields)
  // This creates a case-insensitive regex search across multiple fields
  if (keyword) {
    query.$or = [
      // MongoDB $or operator allows searching in either name OR description
      { name: { $regex: keyword, $options: "i" } }, // 'i' option makes it case insensitive
      { description: { $regex: keyword, $options: "i" } },
    ];
  }

  // Pre-search filters - these are applied before the database query
  // Category filter - exact match
  if (category) query.category = category;
  // Brand filter - exact match
  if (brand) query.brand = brand;

  // Price range filter - handles min price, max price, or both
  if (minPrice || maxPrice) {
    query.price = {}; // Initialize price filter object
    if (minPrice) query.price.$gte = Number(minPrice); // $gte = greater than or equal
    if (maxPrice) query.price.$lte = Number(maxPrice); // $lte = less than or equal
  }

  // Pagination setup
  const currentPage = Number(page) || 1; // Convert to number, default to page 1
  const itemsPerPage = Number(limit) || 10; // Convert to number, default to 10 items
  const skipItems = (currentPage - 1) * itemsPerPage; // Calculate how many items to skip

  // Create base query without execution
  let baseQuery = Product.find(query);

  // Apply sorting if requested (now done at database level for efficiency)
  if (sortBy) {
    const sortOrder = order === "desc" ? -1 : 1;
    const sortOption = {};
    sortOption[sortBy] = sortOrder;
    baseQuery = baseQuery.sort(sortOption);
  }

  // Execute the paginated query
  const products = await baseQuery
    .skip(skipItems) // Skip items from previous pages
    .limit(itemsPerPage); // Limit to items for current page

  // Get total count of matching products (for pagination metadata)
  const totalProducts = await Product.countDocuments(query);

  // Calculate total pages needed
  const totalPages = Math.ceil(totalProducts / itemsPerPage);

  // Return response with products and pagination metadata
  res.status(200).json({
    success: true,
    currentPage,
    itemsPerPage,
    totalProducts,
    totalPages,
    products,
  });
});

// @desc    Add a review to a product
// @route   POST /api/products/:productId/reviews
// @access  Private (user must be logged in)
exports.addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body; // Destructure rating and comment from request body
  const { productId } = req.params; // Extract product ID from URL parameters

  // Find the product in the database by ID
  const product = await Product.findById(productId);

  // If product not found, return a 404 error
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Check if the user has already reviewed the product
  const alreadyReviewed = product.reviews.find(
    (review) => review.user.toString() === req.user._id.toString()
  );

  // If user already reviewed, block further reviews
  if (alreadyReviewed) {
    res.status(400);
    throw new Error("You have already reviewed this product");
  }

  // Create a review object
  const review = {
    name: req.user.name, // Reviewer's name (from logged-in user)
    rating: Number(rating), // Ensure rating is a number
    comment, // The review text
    user: req.user._id, // Store user ID to identify who reviewed
  };

  // Push the review into the product's reviews array
  product.reviews.push(review);

  // Update the number of reviews
  product.numReviews = product.reviews.length;

  // Recalculate the average rating
  product.rating =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  // Save the updated product back to the database
  await product.save();

  // Respond with a success message
  res.status(201).json({ message: "Review added successfully" });
});

// @desc    Get all reviews for a specific product with sorting and pagination
// @route   GET /api/products/:productId/reviews
// @access  Public
exports.getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const page = Number(req.query.page) || 1; // Default page number = 1
  const limit = Number(req.query.limit) || 5; // Default 5 reviews per page
  const sortBy = req.query.sortBy || "date"; // Can be "date" or "rating"

  const startIndex = (page - 1) * limit;

  // Validate product ID
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    res.status(400);
    throw new Error("Invalid product ID");
  }

  // Find product and populate user details in reviews
  const product = await Product.findById(productId).populate({
    path: "reviews.user", // Populate user details from referenced user IDs
    select: "firstName lastName", // Only get first and last name
  });

  // Handle case where product is not found
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Copy reviews to avoid mutating original
  let reviews = [...product.reviews];

  // Sort reviews
  if (sortBy === "rating") {
    reviews.sort((a, b) => b.rating - a.rating); // High to low rating
  } else {
    reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Recent first
  }

  // Total number of reviews
  const totalReviews = reviews.length;

  // Paginate the sorted reviews
  const paginatedReviews = reviews.slice(startIndex, startIndex + limit);

  // Respond with data
  res.status(200).json({
    reviews: paginatedReviews.map((review) => ({
      _id: review._id,
      name: `${review.user?.firstName || "Unknown"} ${
        review.user?.lastName || ""
      }`,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
    })),
    currentPage: page,
    totalPages: Math.ceil(totalReviews / limit),
    totalReviews,
  });
});

// @desc    Admin deletes a specific review from a product
// @route   DELETE /api/products/:productId/reviews/:reviewId
// @access  Admin
exports.deleteReview = asyncHandler(async (req, res) => {
  const { productId, reviewId } = req.params;

  // Check for valid MongoDB ObjectIds
  if (
    !mongoose.Types.ObjectId.isValid(productId) ||
    !mongoose.Types.ObjectId.isValid(reviewId)
  ) {
    res.status(400);
    throw new Error("Invalid product or review ID");
  }

  // Find the product
  const product = await Product.findById(productId);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Find the review within the product's reviews
  const reviewIndex = product.reviews.findIndex(
    (rev) => rev._id.toString() === reviewId
  );

  if (reviewIndex === -1) {
    res.status(404);
    throw new Error("Review not found");
  }

  // Remove the review from the reviews array
  product.reviews.splice(reviewIndex, 1);

  // Update number of reviews
  product.numReviews = product.reviews.length;

  // Recalculate average rating
  if (product.numReviews > 0) {
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.numReviews;
  } else {
    product.rating = 0;
  }

  // Save the updated product
  await product.save();

  res.status(200).json({ message: "Review deleted successfully" });
});
