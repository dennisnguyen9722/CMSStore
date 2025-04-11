const db = require('../config/db');
const fs = require('fs');
const path = require('path');

// Lấy tất cả sản phẩm kèm ảnh
const getAllProducts = async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT p.*, pi.image_url
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id
    `);

    const products = [];

    results.forEach(row => {
      let product = products.find(p => p.id === row.id);
      if (!product) {
        product = {
          id: row.id,
          name: row.name,
          price: row.price,
          category_id: row.category_id,
          description: row.description,
          images: [],
        };
        products.push(product);
      }
      if (row.image_url) {
        product.images.push(row.image_url);
      }
    });

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy sản phẩm', error: err });
  }
};

// Tạo sản phẩm mới
const createProduct = async (req, res) => {
  const { name, price, category_id, description } = req.body;
  const files = req.files;

  try {
    const [result] = await db.query(
      'INSERT INTO products (name, price, category_id, description) VALUES (?, ?, ?, ?)',
      [name, price, category_id, description]
    );

    const productId = result.insertId;

    if (files && files.length > 0) {
      const insertImages = files.map(file => [productId, `/uploads/${file.filename}`]);
      await db.query('INSERT INTO product_images (product_id, image_url) VALUES ?', [insertImages]);
    }

    res.status(201).json({ message: 'Tạo sản phẩm thành công', productId });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi tạo sản phẩm', error: err });
  }
};

// Cập nhật sản phẩm
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, price, category_id, description, keptOldImages = '[]' } = req.body;
  const files = req.files;

  try {
    const parsedKeptImages = JSON.parse(keptOldImages); // Mảng các đường dẫn ảnh giữ lại

    // Cập nhật thông tin sản phẩm
    await db.query(
      'UPDATE products SET name = ?, price = ?, category_id = ?, description = ? WHERE id = ?',
      [name, price, category_id, description, id]
    );

    // Lấy tất cả ảnh cũ
    const [oldImages] = await db.query('SELECT image_url FROM product_images WHERE product_id = ?', [id]);

    // Xác định ảnh nào cần xoá
    const imagesToDelete = oldImages.filter(img => !parsedKeptImages.includes(img.image_url));

    // Xoá ảnh vật lý và DB
    for (const img of imagesToDelete) {
      const imgPath = path.join(__dirname, '..', img.image_url);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    if (imagesToDelete.length > 0) {
      await db.query(
        'DELETE FROM product_images WHERE product_id = ? AND image_url IN (?)',
        [id, imagesToDelete.map(img => img.image_url)]
      );
    }

    // Upload ảnh mới nếu có
    if (files && files.length > 0) {
      const newImages = files.map(file => [id, `/uploads/${file.filename}`]);
      await db.query('INSERT INTO product_images (product_id, image_url) VALUES ?', [newImages]);
    }

    res.json({ message: 'Cập nhật sản phẩm thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi cập nhật sản phẩm', error: err });
  }
};

// Xoá sản phẩm + ảnh
const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const [images] = await db.query('SELECT image_url FROM product_images WHERE product_id = ?', [id]);

    for (const img of images) {
      const imgPath = path.join(__dirname, '..', img.image_url);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await db.query('DELETE FROM product_images WHERE product_id = ?', [id]);
    await db.query('DELETE FROM products WHERE id = ?', [id]);

    res.json({ message: 'Xoá sản phẩm thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi xoá sản phẩm', error: err });
  }
};

module.exports = {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
