const {
  getAllProducts,
  searchProducts,
  getProductById,
  addReview,
  getProductReviews,
  deleteReview,
  getFeaturedProducts,
  getMyReview,
  updateReview,
} = require("../controllers/product_management/productController");
const {
  authenticate,
  authorizeAdmin,
} = require("../middleware/authMiddleware");

const router = require("express").Router();

router.get("/", getAllProducts);
router.get("/featured", getFeaturedProducts);
router.get("/search", searchProducts);
router.get("/:id", getProductById);
router
  .route("/:productId/reviews")
  .post(authenticate, addReview)
  .get(getProductReviews)
  .put(authenticate, updateReview);

router.delete("/:productId/reviews/:reviewId", authenticate, deleteReview);
router.get("/:productId/my-review", authenticate, getMyReview);

module.exports = router;
