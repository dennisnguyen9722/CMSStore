const db = require('../config/db');

// Tạo đơn hàng mới
exports.createOrder = async (req, res) => {
  const { user_id, items, total_price, address, phone } = req.body;

  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    // Tạo đơn hàng
    const [orderResult] = await connection.execute(
      `INSERT INTO orders (user_id, total_price, address, phone, status, created_at)
       VALUES (?, ?, ?, ?, 'pending', NOW())`,
      [user_id, total_price, address, phone]
    );

    const orderId = orderResult.insertId;

    // Tạo chi tiết đơn hàng
    for (const item of items) {
      const { product_id, quantity, price } = item;
      await connection.execute(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES (?, ?, ?, ?)`,
        [orderId, product_id, quantity, price]
      );
    }

    // Xoá giỏ hàng sau khi đặt đơn
    await connection.execute('DELETE FROM carts WHERE user_id = ?', [user_id]);

    await connection.commit();
    connection.release();

    res.json({ message: 'Đặt hàng thành công', orderId });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('createOrder error:', error);
    res.status(500).json({ message: 'Lỗi khi tạo đơn hàng' });
  }
};

// Lấy danh sách đơn hàng theo user
exports.getOrdersByUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const [orders] = await db.execute(
      `SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );
    res.json(orders);
  } catch (error) {
    console.error('getOrdersByUser error:', error);
    res.status(500).json({ message: 'Lỗi khi lấy đơn hàng của người dùng' });
  }
};

// Lấy toàn bộ đơn hàng (cho admin)
exports.getAllOrders = async (req, res) => {
  try {
    const [orders] = await db.execute(
      `SELECT o.*, u.name AS customer_name
       FROM orders o
       JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC`
    );
    res.json(orders);
  } catch (error) {
    console.error('getAllOrders error:', error);
    res.status(500).json({ message: 'Lỗi khi lấy tất cả đơn hàng' });
  }
};

// Lấy chi tiết đơn hàng theo ID
exports.getOrderDetails = async (req, res) => {
  const { orderId } = req.params;
  try {
    const [items] = await db.execute(
      `SELECT oi.*, p.title, p.thumbnail
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [orderId]
    );
    res.json(items);
  } catch (error) {
    console.error('getOrderDetails error:', error);
    res.status(500).json({ message: 'Lỗi khi lấy chi tiết đơn hàng' });
  }
};

// Cập nhật trạng thái đơn hàng (admin xử lý)
exports.updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body; // ex: pending, processing, completed, cancelled

  try {
    await db.execute(
      'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, orderId]
    );
    res.json({ message: 'Cập nhật trạng thái đơn hàng thành công' });
  } catch (error) {
    console.error('updateOrderStatus error:', error);
    res.status(500).json({ message: 'Lỗi khi cập nhật đơn hàng' });
  }
};

// Xoá đơn hàng (tuỳ chọn)
exports.deleteOrder = async (req, res) => {
  const { orderId } = req.params;

  try {
    await db.execute('DELETE FROM order_items WHERE order_id = ?', [orderId]);
    await db.execute('DELETE FROM orders WHERE id = ?', [orderId]);
    res.json({ message: 'Đã xoá đơn hàng' });
  } catch (error) {
    console.error('deleteOrder error:', error);
    res.status(500).json({ message: 'Lỗi khi xoá đơn hàng' });
  }
};
