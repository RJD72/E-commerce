const {
  getUserCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearUserCart,
} = require("../controllers/cart_management/cartController");
const { authenticate } = require("../middleware/authMiddleware");

const router = require("express").Router();

router
  .route("/")
  .get(authenticate, getUserCart)
  .post(authenticate, addToCart)
  .patch(authenticate, updateCartItem);

// router.delete("/:productId", authenticate, removeFromCart);
router.delete("/", authenticate, clearUserCart);

module.exports = router;
