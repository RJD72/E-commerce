const {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} = require("../controllers/wishlist_management/wishlistController");
const { authenticate } = require("../middleware/authMiddleware");

const router = require("express").Router();

router.get("/", authenticate, getWishlist);
router
  .route("/:productId")
  .post(authenticate, addToWishlist)
  .delete(authenticate, removeFromWishlist);

module.exports = router;
