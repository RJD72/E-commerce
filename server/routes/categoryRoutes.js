const router = require("express").Router();
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getProductsByCategory,
} = require("../controllers/category_management/categoryControllers");
const {
  authenticate,
  authorizeAdmin,
} = require("../middleware/authMiddleware");

router
  .route("/")
  .get(getAllCategories)
  .post(authenticate, authorizeAdmin, createCategory);
router
  .route("/:id")
  .get(getCategoryById)
  .patch(authenticate, authorizeAdmin, updateCategory)
  .delete(authenticate, authorizeAdmin, deleteCategory);

router.get("/:id/products", getProductsByCategory);

module.exports = router;
