const {
  getUserOrders,
  createOrder,
} = require("../controllers/order_management/orderController");
const { authenticate } = require("../middleware/authMiddleware");

const router = require("express").Router();

router.post("/", authenticate, createOrder);
router.get("/my-orders", authenticate, getUserOrders);

module.exports = router;
