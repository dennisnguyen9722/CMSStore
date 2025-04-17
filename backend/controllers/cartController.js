const db = require('../config/db');

// Lấy giỏ hàng theo userId
exports.getCartByUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await db.execute(
      `SELECT c.id, c.product_id, c.quantity, p.title, p.price, p.thumbnail
       FROM carts c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?`,
      [userId]
    );
    res.json(rows);
  } catch (error) {
    console.error('getCartByUser error:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy giỏ hàng' });
  }
};

// Thêm sản phẩm vào giỏ hàng
exports.addToCart = async (req, res) => {
  const { user_id, product_id, quantity } = req.body;
  try {
    // Kiểm tra nếu sản phẩm đã có trong giỏ thì tăng số lượng
    const [exist] = await db.execute(
      'SELECT id, quantity FROM carts WHERE user_id = ? AND product_id = ?',
      [user_id, product_id]
    );

    if (exist.length > 0) {
      const newQuantity = exist[0].quantity + (quantity || 1);
      await db.execute(
        'UPDATE carts SET quantity = ?, updated_at = NOW() WHERE id = ?',
        [newQuantity, exist[0].id]
      );
    } else {
      await db.execute(
        'INSERT INTO carts (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [user_id, product_id, quantity || 1]
      );
    }

    res.json({ message: 'Đã thêm vào giỏ hàng' });
  } catch (error) {
    console.error('addToCart error:', error);
    res.status(500).json({ message: 'Lỗi server khi thêm vào giỏ hàng' });
  }
};

// Cập nhật số lượng trong giỏ hàng
exports.updateCartItem = async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  try {
    await db.execute(
      'UPDATE carts SET quantity = ?, updated_at = NOW() WHERE id = ?',
      [quantity, id]
    );
    res.json({ message: 'Cập nhật thành công' });
  } catch (error) {
    console.error('updateCartItem error:', error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật giỏ hàng' });
  }
};

// Xoá 1 sản phẩm khỏi giỏ hàng
exports.deleteCartItem = async (req, res) => {
  const { id } = req.params;

  try {
    await db.execute('DELETE FROM carts WHERE id = ?', [id]);
    res.json({ message: 'Đã xoá sản phẩm khỏi giỏ hàng' });
  } catch (error) {
    console.error('deleteCartItem error:', error);
    res.status(500).json({ message: 'Lỗi server khi xoá sản phẩm' });
  }
};

// Xoá toàn bộ giỏ hàng của user (dùng sau khi đặt hàng)
exports.clearCart = async (req, res) => {
  const { userId } = req.params;

  try {
    await db.execute('DELETE FROM carts WHERE user_id = ?', [userId]);
    res.json({ message: 'Đã xoá toàn bộ giỏ hàng' });
  } catch (error) {
    console.error('clearCart error:', error);
    res.status(500).json({ message: 'Lỗi khi xoá toàn bộ giỏ hàng' });
  }
};
