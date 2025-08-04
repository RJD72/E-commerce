const {
  getUserOrders,
  createOrder,
  getSingleOrder,
} = require("../controllers/order_management/orderController");
const { authenticate } = require("../middleware/authMiddleware");

const router = require("express").Router();

router.get("/my-orders", authenticate, getUserOrders);
router.get("/:id", authenticate, getSingleOrder);
router.post("/", authenticate, createOrder);

module.exports = router;
