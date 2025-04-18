const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");


// Tạo đơn hàng (checkout)
router.post("/", orderController.createOrder);

// Lấy tất cả đơn hàng
router.get("/", orderController.getAllOrders);

// Cập nhật trạng thái đơn hàng, sửa lại route này
router.put("/:id", orderController.updateOrderStatus);  // sửa từ :id/status thành :id

// Xóa đơn hàng
router.delete("/:id", orderController.deleteOrder);


router.put("/ship/:id", orderController.shipOrder);

module.exports = router;
