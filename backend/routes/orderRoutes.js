const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

// Tạo đơn hàng (checkout)
router.post("/", orderController.createOrder);

// Lấy tất cả đơn hàng (dành cho admin)
router.get("/", orderController.getAllOrders);

// Lấy danh sách đơn hàng của một người dùng
router.get("/:userId", orderController.getUserOrders);

// Cập nhật trạng thái đơn hàng
router.put("/:id", orderController.updateOrderStatus);

// Xóa đơn hàng
router.delete("/:id", orderController.deleteOrder);

// Xuất kho đơn hàng
router.put("/ship/:id", orderController.shipOrder);

module.exports = router;