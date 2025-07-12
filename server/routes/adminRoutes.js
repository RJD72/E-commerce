const router = require("express").Router();
const {
  createProduct,
  updateProductByIdAdmin,
  deleteProductByIdAdmin,
} = require("../controllers/admin_management/admin-productController");
const {
  getOrderByIdAdmin,
  updateOrderStatusAdmin,
  getAllOrdersAdmin,
} = require("../controllers/admin_management/admin_orderController");
const {
  getAllUsers,
  getUserById,
  toggleUserStatus,
} = require("../controllers/admin_management/admin_userController");

const {
  authenticate,
  authorizeAdmin,
} = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

// Support multiple images via upload.fields([{ name: 'images' }])
router.post(
  "/products",
  authenticate,
  authorizeAdmin,
  upload.array("images", 5), // Accept up to 5 image files under "images" field
  createProduct
);

router
  .route("/products/:id")
  .patch(
    authenticate,
    authorizeAdmin,
    upload.array("images", 5),
    updateProductByIdAdmin
  )
  .delete(authenticate, authorizeAdmin, deleteProductByIdAdmin);

router.get("/orders", authenticate, authorizeAdmin, getAllOrdersAdmin);
router.get("/orders/:id", authenticate, authorizeAdmin, getOrderByIdAdmin);
router.patch(
  "/orders/:id/status",
  authenticate,
  authorizeAdmin,
  updateOrderStatusAdmin
);

router.get("/users", authenticate, authorizeAdmin, getAllUsers);
router.get("/users/:id", authenticate, authorizeAdmin, getUserById);
router.patch(
  "/users/:id/deactivate",
  authenticate,
  authorizeAdmin,
  toggleUserStatus
);

module.exports = router;
