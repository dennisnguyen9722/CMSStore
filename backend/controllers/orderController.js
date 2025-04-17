// controllers/orderController.js
const db = require("../config/db");

// Lấy danh sách tất cả đơn hàng (dành cho admin)
exports.getAllOrders = async (req, res) => {
  try {
    const [orders] = await db.query("SELECT * FROM orders ORDER BY created_at DESC");

    // Gắn thêm danh sách sản phẩm của từng đơn
    for (const order of orders) {
      const [items] = await db.query(
        `SELECT oi.*, p.name, p.price AS product_price
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }

    res.json(orders);
  } catch (err) {
    console.error("Lỗi lấy danh sách đơn hàng:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Cập nhật trạng thái đơn hàng
exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Kiểm tra trạng thái hợp lệ
  if (!["pending", "paid", "cancelled"].includes(status)) {
    return res.status(400).json({ message: "Trạng thái không hợp lệ" });
  }

  try {
    // Kiểm tra xem đơn hàng có tồn tại không
    const [order] = await db.query("SELECT * FROM orders WHERE id = ?", [id]);
    
    if (!order) {
      return res.status(404).json({ message: "Đơn hàng không tồn tại" });
    }

    // Cập nhật trạng thái đơn hàng
    await db.query("UPDATE orders SET status = ? WHERE id = ?", [status, id]);
    
    // Trả về thông báo thành công cùng với thông tin đơn hàng đã được cập nhật
    res.json({
      message: "Cập nhật trạng thái thành công",
      order: {
        id: order.id,
        status: status,
      },
    });
  } catch (err) {
    console.error("Lỗi cập nhật đơn hàng:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};


// Xoá đơn hàng (cẩn thận khi dùng)
exports.deleteOrder = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query("DELETE FROM order_items WHERE order_id = ?", [id]);
    await db.query("DELETE FROM orders WHERE id = ?", [id]);

    res.json({ message: "Đã xoá đơn hàng" });
  } catch (err) {
    console.error("Lỗi xoá đơn:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};
