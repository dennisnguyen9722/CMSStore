// controllers/orderController.js
const db = require("../config/db");

// Lấy danh sách tất cả đơn hàng (dành cho admin)
exports.getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;

    // Đếm tổng số đơn hàng
    const [countRows] = await db.query("SELECT COUNT(*) AS total FROM orders");
    const totalOrders = countRows[0].total;
    const totalPages = Math.ceil(totalOrders / pageSize);

    // Lấy danh sách đơn hàng theo phân trang
    const [orders] = await db.query(
      "SELECT * FROM orders ORDER BY created_at DESC LIMIT ? OFFSET ?",
      [pageSize, offset]
    );

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

    // Trả kết quả
    res.json({
      orders,
      totalPages,
      currentPage: page,
    });
  } catch (err) {
    console.error("Lỗi lấy danh sách đơn hàng:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Tạo đơn hàng
exports.createOrder = async (req, res) => {
  const { user_id = 'guest', address, phone, items = [] } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: "Giỏ hàng trống" });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Tính tổng giá
    let total_price = 0;

    for (const item of items) {
      const [rows] = await connection.query('SELECT price FROM products WHERE id = ?', [item.product_id]);
      if (rows.length === 0) throw new Error(`Không tìm thấy sản phẩm ID ${item.product_id}`);

      const product = rows[0];
      total_price += product.price * item.quantity;
    }

    // Tạo đơn hàng
    const [result] = await connection.query(
      'INSERT INTO orders (user_id, total_price, address, phone, status, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [user_id, total_price, address, phone, 'pending']
    );
    const orderId = result.insertId;

    // Lưu chi tiết đơn hàng (không trừ kho ở đây)
    for (const item of items) {
      const [productRows] = await connection.query('SELECT price FROM products WHERE id = ?', [item.product_id]);
      const productPrice = productRows[0].price;

      await connection.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, productPrice]
      );
    }

    await connection.commit();
    res.status(201).json({ message: "Đặt hàng thành công", orderId });

  } catch (err) {
    await connection.rollback();
    console.error("Lỗi tạo đơn hàng:", err);
    res.status(500).json({ message: "Lỗi tạo đơn hàng", error: err.message });
  } finally {
    connection.release();
  }
};

// Cập nhật trạng thái đơn hàng
exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status: newStatus } = req.body;

  const validStatuses = ["pending", "paid", "cancelled", "shipped"];
  if (!validStatuses.includes(newStatus)) {
    return res.status(400).json({ message: "Trạng thái không hợp lệ" });
  }

  try {
    // Lấy trạng thái hiện tại của đơn hàng
    const [rows] = await db.query("SELECT * FROM orders WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Đơn hàng không tồn tại" });
    }

    const order = rows[0];
    const currentStatus = order.status;

    // Kiểm tra luồng hợp lệ
    const validTransitions = {
      pending: ["paid", "cancelled"],
      paid: ["shipped"],
      cancelled: [],
      shipped: []
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      return res.status(400).json({
        message: `Không thể chuyển từ trạng thái "${currentStatus}" sang "${newStatus}"`
      });
    }

    // Nếu chuyển sang shipped => trừ kho
    if (newStatus === "shipped") {
      const [items] = await db.query(
        "SELECT product_id, quantity FROM order_items WHERE order_id = ?",
        [id]
      );

      for (const item of items) {
        const [productRows] = await db.query("SELECT stock FROM products WHERE id = ?", [item.product_id]);
        const stock = productRows[0].stock;

        if (stock < item.quantity) {
          return res.status(400).json({
            message: `Không đủ hàng cho sản phẩm ID ${item.product_id}`
          });
        }

        await db.query(
          "UPDATE products SET stock = stock - ? WHERE id = ?",
          [item.quantity, item.product_id]
        );
      }
    }

    // Cập nhật trạng thái
    await db.query("UPDATE orders SET status = ? WHERE id = ?", [newStatus, id]);

    res.json({
      message: "Cập nhật trạng thái thành công",
      order: {
        id,
        from: currentStatus,
        to: newStatus,
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

exports.shipOrder = async (req, res) => {
  const { id } = req.params;

  try {
    // Kiểm tra đơn hàng có tồn tại và trạng thái là "paid"
    const [order] = await db.query("SELECT * FROM orders WHERE id = ?", [id]);

    if (!order) {
      return res.status(404).json({ message: "Đơn hàng không tồn tại" });
    }

    if (order.status !== 'paid') {
      return res.status(400).json({ message: "Đơn hàng chưa thanh toán" });
    }

    // Duyệt qua các sản phẩm trong đơn hàng và trừ tồn kho
    for (const item of order.items) {
      const { product_id, quantity } = item;

      // Cập nhật số lượng tồn kho
      const [product] = await db.query("SELECT stock FROM products WHERE id = ?", [product_id]);

      if (product.stock < quantity) {
        return res.status(400).json({ message: `Không đủ hàng cho sản phẩm ID ${product_id}` });
      }

      // Trừ tồn kho
      await db.query(
        "UPDATE products SET stock = stock - ? WHERE id = ?",
        [quantity, product_id]
      );
    }

    // Cập nhật trạng thái đơn hàng thành "shipped"
    await db.query("UPDATE orders SET status = ? WHERE id = ?", ['shipped', id]);

    res.json({ message: "Đơn hàng đã được xuất kho thành công" });
  } catch (err) {
    console.error("Lỗi xuất kho:", err);
    res.status(500).json({ message: "Lỗi server khi xuất kho" });
  }
};



