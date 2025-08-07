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

const {
  getMonthlySales,
  getTopProducts,
  getOrderStatusStats,
  getPaymentMethodStats,
} = require("../controllers/dashboard_management/dashboardController");

// Admin product routes
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

// Admin order routes
router.get("/orders", authenticate, authorizeAdmin, getAllOrdersAdmin);
router.get("/orders/:id", authenticate, authorizeAdmin, getOrderByIdAdmin);
router.patch(
  "/orders/:id/status",
  authenticate,
  authorizeAdmin,
  updateOrderStatusAdmin
);

// Admin user routes
router.get("/users", authenticate, authorizeAdmin, getAllUsers);
router.get("/users/:id", authenticate, authorizeAdmin, getUserById);
router.patch(
  "/users/:id/deactivate",
  authenticate,
  authorizeAdmin,
  toggleUserStatus
);

// Admin dashboard routes
router.get("/dashboard/sales", authenticate, authorizeAdmin, getMonthlySales);
router.get(
  "/dashboard/top-products",
  authenticate,
  authorizeAdmin,
  getTopProducts
);
router.get(
  "/dashboard/order-status",
  authenticate,
  authorizeAdmin,
  getOrderStatusStats
);
router.get(
  "/dashboard/payment-methods",
  authenticate,
  authorizeAdmin,
  getPaymentMethodStats
);
module.exports = router;
