const { asyncHandler } = require("../../middleware/asyncHandler"); // Handles async errors
const User = require("../../models/userModels");
const Product = require("../../models/productModel");

// @desc    Add a product to the user's wishlist with timestamp
// @route   POST /api/wishlist/:productId
// @access  Private
exports.addToWishlist = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const productId = req.params.productId;

  // Step 1: Check if the product exists
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  // Step 2: Find the user
  const user = await User.findById(userId);

  // Step 3: Check if product is already in the wishlist
  const alreadyInWishlist = user.wishList.some(
    (item) => item.productId.toString() === productId
  );

  if (alreadyInWishlist) {
    return res.status(400).json({ message: "Product already in wishlist" });
  }

  // Step 4: Add product with timestamp
  user.wishList.push({ productId, dateAdded: new Date() });

  // Step 5: Save user
  await user.save();

  res.status(200).json({
    message: "Product added to wishlist",
    wishList: user.wishList,
  });
});

// @desc    Get user's wishlist with pagination, sorted by dateAdded (newest first)
// @route   GET /api/wishlist?page=1&limit=10
// @access  Private
exports.getWishlist = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Step 1: Get user with populated wishlist
  const user = await User.findById(userId).lean();
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Step 2: Sort wishlist by dateAdded descending
  const sortedWishlist = user.wishList
    .slice()
    .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));

  const totalWishlistItems = sortedWishlist.length;

  // Step 3: Apply pagination
  const paginatedWishlist = sortedWishlist.slice(skip, skip + limit);

  // Step 4: Fetch full product documents
  const productIds = paginatedWishlist.map((item) => item.productId);
  const products = await Product.find({ _id: { $in: productIds } });

  // Step 5: Attach dateAdded to each product (matched by ID)
  const finalResults = paginatedWishlist.map((item) => {
    const product = products.find(
      (p) => p._id.toString() === item.productId.toString()
    );
    return product
      ? { ...product.toObject(), dateAdded: item.dateAdded }
      : null;
  });

  res.status(200).json({
    page,
    totalPages: Math.ceil(totalWishlistItems / limit),
    totalItems: totalWishlistItems,
    wishlist: finalResults.filter(Boolean),
  });
});

// @desc    Remove a product from the user's wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
exports.removeFromWishlist = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const productId = req.params.productId;

  // Step 1: Find the user
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Step 2: Filter out the product from the wishlist
  const originalLength = user.wishList.length;
  user.wishList = user.wishList.filter(
    (item) => item.productId.toString() !== productId
  );

  // Step 3: Check if anything was removed
  if (user.wishList.length === originalLength) {
    return res.status(404).json({ message: "Product not found in wishlist" });
  }

  // Step 4: Save updated user document
  await user.save();

  res.status(200).json({
    message: "Product removed from wishlist",
    wishList: user.wishList,
  });
});
