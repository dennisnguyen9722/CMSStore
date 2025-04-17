const db = require('../config/db');

exports.addToCart = async (req, res) => {
  const { user_id, product_id, quantity } = req.body;

  if (!user_id || !product_id || !quantity) {
    return res.status(400).json({ message: 'Thiếu thông tin sản phẩm' });
  }

  try {
    const [rows] = await db.execute(
      'SELECT * FROM carts WHERE user_id = ? AND product_id = ?',
      [user_id, product_id]
    );

    if (rows.length > 0) {
      await db.execute(
        'UPDATE carts SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?',
        [quantity, user_id, product_id]
      );
    } else {
      await db.execute(
        'INSERT INTO carts (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [user_id, product_id, quantity]
      );
    }

    res.json({ message: 'Đã thêm vào giỏ hàng' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi khi thêm vào giỏ hàng' });
  }
};

exports.getCartByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const [rows] = await db.execute(`
      SELECT c.id, c.product_id, c.quantity, p.name, p.price, pi.image_url AS image
      FROM carts c
      JOIN products p ON c.product_id = p.id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE c.user_id = ?
    `, [userId]);

    const productsInCart = [];

    rows.forEach(row => {
      let product = productsInCart.find(p => p.product_id === row.product_id);
      if (!product) {
        product = {
          product_id: row.product_id,
          name: row.name,
          price: row.price,
          quantity: row.quantity,
          images: row.image ? [row.image] : [], // Nếu có ảnh, thêm vào mảng images
        };
        productsInCart.push(product);
      } else {
        if (row.image) {
          product.images.push(row.image); // Thêm ảnh vào mảng images
        }
      }
    });

    res.json(productsInCart); // Trả về danh sách sản phẩm trong giỏ hàng
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi khi lấy giỏ hàng' });
  }
};


