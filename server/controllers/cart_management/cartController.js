const { asyncHandler } = require("../../middleware/asyncHandler");
const User = require("../../models/userModels");
const Product = require("../../models/productModel");

// @desc    Get the logged-in user's cart
// @route   GET /api/cart
// @access  Private (requires valid JWT token in Authorization header)
exports.getUserCart = asyncHandler(async (req, res) => {
  // `req.user` should be populated by your auth middleware after verifying the token
  const userId = req.user._id;

  // Find the user by ID and populate the cart's productId with product details
  const user = await User.findById(userId).populate("cart.productId");

  // Handle case where user isn't found (e.g. token is valid but user was deleted)
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Respond with the cart array (including populated product data)
  res.status(200).json(user.cart);
});

// @desc    Add or update product in user's cart (limited by stock)
// @route   POST /api/cart
// @access  Private
exports.addToCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { productId, quantity } = req.body;

  // Validation: ensure productId and quantity are provided
  if (!productId || !quantity || quantity < 1) {
    return res
      .status(400)
      .json({ message: "Product ID and valid quantity are required" });
  }

  // Fetch product to verify it exists and check stock
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  // Check available stock
  const stockAvailable = product.stock;
  if (stockAvailable < 1) {
    return res.status(400).json({ message: "Product is out of stock" });
  }

  // Fetch the user
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Check if the product is already in the user's cart
  const cartItem = user.cart.find(
    (item) => item.productId.toString() === productId
  );

  if (cartItem) {
    // Calculate the new quantity if user is adding more
    const newQuantity = cartItem.quantity + quantity;

    if (newQuantity > stockAvailable) {
      return res.status(400).json({
        message: `Cannot add ${quantity}. Only ${
          stockAvailable - cartItem.quantity
        } more available in stock.`,
      });
    }

    // Update the quantity
    cartItem.quantity = newQuantity;
  } else {
    // New item, ensure requested quantity does not exceed stock
    if (quantity > stockAvailable) {
      return res.status(400).json({
        message: `Only ${stockAvailable} items available in stock.`,
      });
    }

    // Add new item to the cart
    user.cart.push({ productId, quantity });
  }

  // Save updated cart to DB
  await user.save();

  // Return populated cart with product details
  const updatedUser = await User.findById(userId).populate("cart.productId");
  res.status(200).json(updatedUser.cart);
});

// @desc    Update the quantity of a cart item
// @route   PUT /api/cart
// @access  Private
exports.updateCartItem = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { productId, quantity } = req.body;

  // Validate inputs
  if (!productId || typeof quantity !== "number" || quantity < 0) {
    return res
      .status(400)
      .json({ message: "Product ID and valid quantity are required" });
  }

  // Find product and check stock
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  const stockAvailable = product.stock;

  if (quantity > stockAvailable) {
    return res
      .status(400)
      .json({ message: `Only ${stockAvailable} items available in stock.` });
  }

  // Find user
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Find item in cart
  const cartItem = user.cart.find(
    (item) => item.productId.toString() === productId
  );

  if (!cartItem) {
    return res.status(404).json({ message: "Item not found in cart" });
  }

  if (quantity === 0) {
    // Remove item from cart if quantity is set to 0
    user.cart = user.cart.filter(
      (item) => item.productId.toString() !== productId
    );
  } else {
    // Update the item's quantity
    cartItem.quantity = quantity;
  }

  // Save changes
  await user.save();

  // Return updated cart with populated product details
  const updatedUser = await User.findById(userId).populate("cart.productId");
  res.status(200).json(updatedUser.cart);
});

// @desc    Remove a product from the user's cart
// @route   DELETE /api/cart/:productId
// @access  Private
exports.removeFromCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const productId = req.params.productId;

  // Validate presence of productId
  if (!productId) {
    return res.status(400).json({ message: "Product ID is required" });
  }

  // Find the user
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Check if the product is actually in the user's cart
  const cartItemExists = user.cart.some(
    (item) => item.productId.toString() === productId
  );

  if (!cartItemExists) {
    return res.status(404).json({ message: "Product not found in cart" });
  }

  // Remove the item by filtering it out
  user.cart = user.cart.filter(
    (item) => item.productId.toString() !== productId
  );

  // Save the updated user document
  await user.save();

  // Return updated cart with populated product details
  const updatedUser = await User.findById(userId).populate("cart.productId");
  res.status(200).json(updatedUser.cart);
});
