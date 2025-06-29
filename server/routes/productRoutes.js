const {
  getAllProducts,
  searchProducts,
  getProductById,
  addReview,
  getProductReviews,
  deleteReview,
} = require("../controllers/product_management/productController");
const {
  authenticate,
  authorizeAdmin,
} = require("../middleware/authMiddleware");

const router = require("express").Router();

router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.get("/search", searchProducts);
router
  .route(":productId/reviews")
  .post(authenticate, addReview)
  .get(getProductReviews);

router.delete(
  "/:productId/reviews/:reviewId",
  authenticate,
  authorizeAdmin,
  deleteReview
);

module.exports = router;
