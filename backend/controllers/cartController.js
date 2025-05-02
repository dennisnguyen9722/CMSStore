const db = require('../config/db');

exports.addToCart = async (req, res) => {
  const { user_id, product_id, quantity, color, image_url } = req.body;
  console.log('Request to addToCart:', { user_id, product_id, quantity, color, image_url });

  if (!user_id || !product_id || !quantity || quantity < 1 || !color || !image_url) {
    console.log('Invalid cart item data:', req.body);
    return res.status(400).json({ message: 'Thiếu thông tin bắt buộc (user_id, product_id, quantity, color, image_url)' });
  }

  try {
    // Kiểm tra sản phẩm tồn tại và đủ hàng
    const [productRows] = await db.execute('SELECT stock FROM products WHERE id = ?', [product_id]);
    if (productRows.length === 0) {
      console.log(`Product not found: ${product_id}`);
      return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
    }
    if (productRows[0].stock < quantity) {
      console.log(`Insufficient stock for product ${product_id}: ${productRows[0].stock}`);
      return res.status(400).json({ message: 'Không đủ hàng trong kho' });
    }

    // Kiểm tra màu sắc hợp lệ
    const [colorRows] = await db.execute(
      'SELECT color_name FROM product_colors WHERE product_id = ? AND color_name = ?',
      [product_id, color]
    );
    if (colorRows.length === 0) {
      console.log(`Invalid color for product ${product_id}: ${color}`);
      return res.status(400).json({ message: 'Màu sắc không hợp lệ' });
    }

    // Kiểm tra giỏ hàng hiện tại
    const [rows] = await db.execute(
      'SELECT id, quantity FROM carts WHERE user_id = ? AND product_id = ? AND color = ?',
      [user_id, product_id, color]
    );

    if (rows.length > 0) {
      // Cập nhật quantity nếu sản phẩm (với màu) đã có
      const newQuantity = rows[0].quantity + quantity;
      if (newQuantity > productRows[0].stock) {
        console.log(`Total quantity exceeds stock for product ${product_id}: ${newQuantity}`);
        return res.status(400).json({ message: 'Tổng số lượng vượt quá tồn kho' });
      }
      await db.execute(
        'UPDATE carts SET quantity = ? WHERE id = ?',
        [newQuantity, rows[0].id]
      );
      console.log(`Updated cart: user ${user_id}, product ${product_id}, color ${color}, new quantity ${newQuantity}`);
      return res.status(200).json({ message: 'Cập nhật giỏ hàng thành công' });
    } else {
      // Thêm mới vào giỏ
      await db.execute(
        'INSERT INTO carts (user_id, product_id, quantity, color, image_url) VALUES (?, ?, ?, ?, ?)',
        [user_id, product_id, quantity, color, image_url]
      );
      console.log(`Added to cart: user ${user_id}, product ${product_id}, color ${color}, quantity ${quantity}`);
      return res.status(201).json({ message: 'Thêm vào giỏ hàng thành công' });
    }
  } catch (err) {
    console.error('Error in addToCart:', err);
    return res.status(500).json({ message: 'Lỗi server khi thêm vào giỏ hàng', error: err.message });
  }
};

// Giữ nguyên các hàm khác
exports.getCartByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const [rows] = await db.execute(`
      SELECT c.id, c.product_id, c.quantity, c.color, c.image_url,
             p.name, p.price
      FROM carts c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
    `, [userId]);

    const productsInCart = rows.map(row => ({
      id: row.id,
      product_id: row.product_id,
      name: row.name,
      price: row.price,
      quantity: row.quantity,
      color: row.color,
      image: row.image_url,
    }));
    res.json(productsInCart);
  } catch (err) {
    console.error('Error in getCartByUser:', err);
    res.status(500).json({ message: 'Lỗi khi lấy giỏ hàng', error: err.message });
  }
};

exports.updateCartItem = async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  console.log(`Updating cart item ${id} with quantity ${quantity}`);

  if (!quantity || quantity < 1) {
    console.log('Invalid quantity:', quantity);
    return res.status(400).json({ message: 'Số lượng không hợp lệ' });
  }

  try {
    const [cartRows] = await db.execute('SELECT product_id, quantity FROM carts WHERE id = ?', [id]);
    if (cartRows.length === 0) {
      console.log(`Cart item not found: ${id}`);
      return res.status(404).json({ message: 'Mục giỏ hàng không tồn tại' });
    }

    const { product_id } = cartRows[0];
    const [productRows] = await db.execute('SELECT stock FROM products WHERE id = ?', [product_id]);
    if (productRows[0].stock < quantity) {
      console.log(`Insufficient stock for product ${product_id}: ${productRows[0].stock}`);
      return res.status(400).json({ message: 'Không đủ hàng trong kho' });
    }

    await db.execute('UPDATE carts SET quantity = ? WHERE id = ?', [quantity, id]);
    console.log(`Updated cart item ${id} to quantity ${quantity}`);
    res.json({ message: 'Cập nhật giỏ hàng thành công' });
  } catch (err) {
    console.error('Error in updateCartItem:', err);
    res.status(500).json({ message: 'Lỗi khi cập nhật giỏ hàng', error: err.message });
  }
};

exports.deleteCartItem = async (req, res) => {
  const { id } = req.params;
  console.log(`Deleting cart item ${id}`);

  try {
    const [cartRows] = await db.execute('SELECT id FROM carts WHERE id = ?', [id]);
    if (cartRows.length === 0) {
      console.log(`Cart item not found: ${id}`);
      return res.status(404).json({ message: 'Mục giỏ hàng không tồn tại' });
    }

    await db.execute('DELETE FROM carts WHERE id = ?', [id]);
    console.log(`Deleted cart item ${id}`);
    res.json({ message: 'Xóa mục giỏ hàng thành công' });
  } catch (err) {
    console.error('Error in deleteCartItem:', err);
    res.status(500).json({ message: 'Lỗi khi xóa giỏ hàng', error: err.message });
  }
};

exports.getCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const [cartItems] = await db.query(
      `SELECT c.*, p.name, p.price, pi.image_url AS image
       FROM cart c
       JOIN products p ON c.product_id = p.id
       LEFT JOIN product_images pi ON p.id = pi.product_id
       WHERE c.user_id = ?
       GROUP BY c.id, p.id, pi.id
       LIMIT 1`,
      [userId]
    );
    res.json(cartItems);
  } catch (err) {
    console.error("Lỗi lấy giỏ hàng:", err.stack);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};