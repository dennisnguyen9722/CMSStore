const db = require('../config/db');
const fs = require('fs');
const path = require('path');

// Lấy tất cả sản phẩm kèm ảnh và màu sắc
const getAllProducts = async (req, res) => {
  try {
    const categoryId = req.query.category_id;

    let query = `
      SELECT p.*, pi.image_url, pi.color_id, pc.id AS color_id, pc.color_name, pc.color_code
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id
      LEFT JOIN product_colors pc ON p.id = pc.product_id
    `;

    const params = [];

    if (categoryId) {
      query += ` WHERE p.category_id = ?`;
      params.push(categoryId);
    }

    const [results] = await db.query(query, params);

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
          colors: [],
        };
        products.push(product);
      }
      if (row.image_url) {
        product.images.push({ url: row.image_url, color_id: row.color_id });
      }
      if (row.color_name && !product.colors.some(c => c.name === row.color_name)) {
        product.colors.push({ id: row.color_id, name: row.color_name, code: row.color_code });
      }
    });

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy sản phẩm', error: err });
  }
};

// Tạo sản phẩm mới
const createProduct = async (req, res) => {
  const { name, price, stock, category_id, description, is_featured = false, colors = '[]' } = req.body;
  const files = req.files;

  try {
    const parsedColors = JSON.parse(colors); // Mảng [{ name, code, images: [File] }]
    let productId;

    // Kiểm tra id tái sử dụng
    const [deletedIds] = await db.query('SELECT id FROM deleted_product_ids ORDER BY id ASC LIMIT 1');

    if (deletedIds.length > 0) {
      productId = deletedIds[0].id;
      await db.query('DELETE FROM deleted_product_ids WHERE id = ?', [productId]);
      await db.query(
        'INSERT INTO products (id, name, price, stock, category_id, description, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [productId, name, price, stock, category_id, description, is_featured]
      );
    } else {
      const [result] = await db.query(
        'INSERT INTO products (name, price, stock, category_id, description, is_featured) VALUES (?, ?, ?, ?, ?, ?)',
        [name, price, stock, category_id, description, is_featured]
      );
      productId = result.insertId;
    }

    // Thêm màu sắc và lấy color_id
    const colorIds = {};
    if (parsedColors.length > 0) {
      for (const color of parsedColors) {
        const [result] = await db.query(
          'INSERT INTO product_colors (product_id, color_name, color_code) VALUES (?, ?, ?)',
          [productId, color.name, color.code]
        );
        colorIds[color.name] = result.insertId;
      }
    }

    // Thêm ảnh
    if (files && files.length > 0) {
      const insertImages = files.map(file => {
        const colorName = file.originalname.split('_')[0]; // Giả sử tên file có dạng: <colorName>_image.jpg
        const colorId = colorIds[colorName] || null;
        return [productId, `/uploads/${file.filename}`, colorId];
      });
      await db.query('INSERT INTO product_images (product_id, image_url, color_id) VALUES ?', [insertImages]);
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
  const { name, price, stock, category_id, description, keptOldImages = '[]', is_featured = false, colors = '[]' } = req.body;
  const files = req.files;

  try {
    const parsedKeptImages = JSON.parse(keptOldImages);
    const parsedColors = JSON.parse(colors); // Mảng [{ name, code, images: [File] }]

    // Cập nhật thông tin sản phẩm
    await db.query(
      'UPDATE products SET name = ?, price = ?, stock = ?, category_id = ?, description = ?, is_featured = ? WHERE id = ?',
      [name, price, stock, category_id, description, is_featured, id]
    );

    // Xử lý ảnh
    const [oldImages] = await db.query('SELECT image_url FROM product_images WHERE product_id = ?', [id]);
    const imagesToDelete = oldImages.filter(img => !parsedKeptImages.includes(img.image_url));

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

    // Xử lý màu sắc
    await db.query('DELETE FROM product_colors WHERE product_id = ?', [id]); // Xóa màu cũ
    const colorIds = {};
    if (parsedColors.length > 0) {
      for (const color of parsedColors) {
        const [result] = await db.query(
          'INSERT INTO product_colors (product_id, color_name, color_code) VALUES (?, ?, ?)',
          [id, color.name, color.code]
        );
        colorIds[color.name] = result.insertId;
      }
    }

    // Thêm ảnh mới
    if (files && files.length > 0) {
      const insertImages = files.map(file => {
        const colorName = file.originalname.split('_')[0]; // Giả sử tên file có dạng: <colorName>_image.jpg
        const colorId = colorIds[colorName] || null;
        return [id, `/uploads/${file.filename}`, colorId];
      });
      await db.query('INSERT INTO product_images (product_id, image_url, color_id) VALUES ?', [insertImages]);
    }

    res.json({ message: 'Cập nhật sản phẩm thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi cập nhật sản phẩm', error: err });
  }
};

// Xoá sản phẩm + ảnh + màu sắc
const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const [images] = await db.query('SELECT image_url FROM product_images WHERE product_id = ?', [id]);

    for (const img of images) {
      const imgPath = path.join(__dirname, '..', img.image_url);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await db.query('DELETE FROM product_images WHERE product_id = ?', [id]);
    await db.query('DELETE FROM product_colors WHERE product_id = ?', [id]);
    await db.query('INSERT INTO deleted_product_ids (id) VALUES (?)', [id]);
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

const searchProducts = async (req, res) => {
  const query = req.query.q || "";
  try {
    const [rows] = await db.query(
      `SELECT p.id, p.name, p.description, p.price, p.category_id, p.created_at, p.is_featured, p.stock, 
              pi.image_url, pi.color_id, pc.id AS color_id, pc.color_name, pc.color_code
       FROM products p
       LEFT JOIN product_images pi ON p.id = pi.product_id
       LEFT JOIN product_colors pc ON p.id = pc.product_id
       WHERE p.name LIKE ?`,
      [`%${query}%`]
    );

    const products = rows.reduce((acc, row) => {
      let product = acc.find((p) => p.id === row.id);
      if (!product) {
        product = {
          id: row.id,
          name: row.name,
          description: row.description,
          price: row.price,
          category_id: row.category_id,
          created_at: row.created_at,
          is_featured: row.is_featured,
          stock: row.stock,
          images: [],
          colors: [],
        };
        acc.push(product);
      }
      if (row.image_url) {
        product.images.push({ url: row.image_url, color_id: row.color_id });
      }
      if (row.color_name && !product.colors.some(c => c.name === row.color_name)) {
        product.colors.push({ id: row.color_id, name: row.color_name, code: row.color_code });
      }
      return acc;
    }, []);

    res.json(products);
  } catch (error) {
    console.error("Lỗi tìm kiếm sản phẩm:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

const getFilteredProducts = async (req, res) => {
  const category_id = req.query.category_id || null;
  const priceRange = req.query.priceRange ? String(req.query.priceRange).toLowerCase() : null;

  let query = `
    SELECT p.*, pi.image_url, pi.color_id, pc.id AS color_id, pc.color_name, pc.color_code
    FROM products p
    LEFT JOIN product_images pi ON p.id = pi.product_id
    LEFT JOIN product_colors pc ON p.id = pc.product_id
    WHERE 1 = 1
  `;
  const params = [];

  if (category_id) {
    query += " AND p.category_id = ?";
    params.push(category_id);
  }

  if (priceRange) {
    if (priceRange === "under-1m") {
      query += " AND CAST(p.price AS DECIMAL) <= 1000000";
    } else if (priceRange === "1m-5m") {
      query += " AND CAST(p.price AS DECIMAL) > 1000000 AND CAST(p.price AS DECIMAL) <= 5000000";
    } else if (priceRange === "above-5m") {
      query += " AND CAST(p.price AS DECIMAL) > 5000000";
    } else {
      console.log('Invalid priceRange value:', priceRange);
      return res.status(400).json({ message: `Giá trị priceRange không hợp lệ: ${priceRange}` });
    }
  }

  try {
    const [rows] = await db.query(query, params);
    const products = [];
    rows.forEach(row => {
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
          colors: [],
        };
        products.push(product);
      }
      if (row.image_url) {
        product.images.push({ url: row.image_url, color_id: row.color_id });
      }
      if (row.color_name && !product.colors.some(c => c.name === row.color_name)) {
        product.colors.push({ id: row.color_id, name: row.color_name, code: row.color_code });
      }
    });
    res.json(products);
  } catch (error) {
    console.error('Error in getFilteredProducts:', error);
    res.status(500).json({ message: 'Lỗi server khi tìm sản phẩm', error: error.message });
  }
};

const getProductById = async (req, res) => {
  const { id } = req.params;
  console.log(`Fetching product with ID: ${id}`);

  try {
    const query = `
      SELECT p.*, pi.image_url, pi.color_id, pc.id AS color_id, pc.color_name, pc.color_code
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id
      LEFT JOIN product_colors pc ON p.id = pc.product_id
      WHERE p.id = ?
    `;
    const [rows] = await db.query(query, [id]);

    if (rows.length === 0) {
      console.log(`Product not found: ${id}`);
      return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
    }

    const product = {
      id: rows[0].id,
      name: rows[0].name,
      price: rows[0].price,
      stock: rows[0].stock,
      category_id: rows[0].category_id,
      description: rows[0].description,
      is_featured: rows[0].is_featured,
      images: [],
      colors: [],
    };

    rows.forEach(row => {
      if (row.image_url) {
        product.images.push({ url: row.image_url, color_id: row.color_id });
      }
      if (row.color_name && !product.colors.some(c => c.name === row.color_name)) {
        product.colors.push({ id: row.color_id, name: row.color_name, code: row.color_code });
      }
    });

    console.log('Product fetched:', product);
    res.json(product);
  } catch (error) {
    console.error('Error in getProductById:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy sản phẩm', error: error.message });
  }
};

module.exports = {
  getAllProducts,
  searchProducts,
  createProduct,
  updateProduct,
  updateFeaturedStatus,
  deleteProduct,
  getProductById,
  getFilteredProducts
};