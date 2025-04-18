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
          stock: row.stock,
          category_id: row.category_id,
          description: row.description,
          is_featured: row.is_featured,
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
// Tạo sản phẩm mới
const createProduct = async (req, res) => {
  const { name, price, stock, category_id, description, is_featured = false } = req.body;
  const files = req.files;

  try {
    let productId;

    // Kiểm tra xem có id nào bị xoá không
    const [deletedIds] = await db.query('SELECT id FROM deleted_product_ids ORDER BY id ASC LIMIT 1');

    if (deletedIds.length > 0) {
      // Nếu có id đã xoá, sử dụng lại id đó
      productId = deletedIds[0].id;

      // Xoá id khỏi bảng deleted_product_ids
      await db.query('DELETE FROM deleted_product_ids WHERE id = ?', [productId]);

      // Dùng id đó để chèn sản phẩm mới bằng cách chỉ định rõ ID
      await db.query(
        'INSERT INTO products (id, name, price, stock, category_id, description, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [productId, name, price, stock, category_id, description, is_featured]
      );
    } else {
      // Không có id tái sử dụng => để DB tự tăng
      const [result] = await db.query(
        'INSERT INTO products (name, price, stock, category_id, description, is_featured) VALUES (?, ?, ?, ?, ?, ?)',
        [name, price, stock, category_id, description, is_featured]
      );
      productId = result.insertId;
    }

    // Thêm ảnh nếu có
    if (files && files.length > 0) {
      const insertImages = files.map(file => [productId, `/uploads/${file.filename}`]);
      await db.query('INSERT INTO product_images (product_id, image_url) VALUES ?', [insertImages]);
    }

    res.status(201).json({ message: 'Tạo sản phẩm thành công', productId });
  } catch (err) {
    console.error('Lỗi tạo sản phẩm:', err);
    res.status(500).json({ message: 'Lỗi tạo sản phẩm', error: err });
  }
};

// Cập nhật sản phẩm
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, price, stock, category_id, description, keptOldImages = '[]', is_featured = false } = req.body;
  const files = req.files;

  try {
    const parsedKeptImages = JSON.parse(keptOldImages); // Mảng các đường dẫn ảnh giữ lại

    // Cập nhật thông tin sản phẩm
    await db.query(
      'UPDATE products SET name = ?, price = ?, stock = ?, category_id = ?, description = ?, is_featured = ? WHERE id = ?',
      [name, price, stock, category_id, description, is_featured, id]
    );

    await db.query(
      'UPDATE products SET is_featured = ? WHERE id = ?',
      [is_featured, id]
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

    // Xoá ảnh vật lý
    for (const img of images) {
      const imgPath = path.join(__dirname, '..', img.image_url);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    // Xoá ảnh trong DB
    await db.query('DELETE FROM product_images WHERE product_id = ?', [id]);

    // Lưu lại id đã xoá vào bảng deleted_product_ids
    await db.query('INSERT INTO deleted_product_ids (id) VALUES (?)', [id]);

    // Xoá sản phẩm khỏi bảng products
    await db.query('DELETE FROM products WHERE id = ?', [id]);

    res.json({ message: 'Xoá sản phẩm thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi xoá sản phẩm', error: err });
  }
};


const updateFeaturedStatus = async (req, res) => {
  const { id } = req.params;
  const { is_featured } = req.body;

  try {
    await db.query('UPDATE products SET is_featured = ? WHERE id = ?', [is_featured, id]);
    res.json({ message: 'Cập nhật trạng thái nổi bật thành công' });
  } catch (error) {
    console.error('Lỗi khi cập nhật is_featured:', error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật is_featured' });
  }
};

module.exports = {
  getAllProducts,
  createProduct,
  updateProduct,
  updateFeaturedStatus,
  deleteProduct,
};
