const db = require('../config/db');

// Lấy tất cả danh mục
const getAllCategories = async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM categories');
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy danh mục', error: err });
  }
};

// Tạo danh mục mới (ưu tiên dùng lại ID đã xoá)
const createCategory = async (req, res) => {
  const { name, description } = req.body;
  try {
    let categoryId;

    // Tìm ID tái sử dụng nếu có
    const [deletedIds] = await db.query('SELECT id FROM deleted_category_ids ORDER BY id ASC LIMIT 1');

    if (deletedIds.length > 0) {
      categoryId = deletedIds[0].id;

      // Xoá khỏi bảng deleted
      await db.query('DELETE FROM deleted_category_ids WHERE id = ?', [categoryId]);

      // Tạo danh mục với ID cụ thể
      await db.query(
        'INSERT INTO categories (id, name, description) VALUES (?, ?, ?)',
        [categoryId, name, description]
      );
    } else {
      // Không có ID cũ → dùng AUTO_INCREMENT
      const [result] = await db.query(
        'INSERT INTO categories (name, description) VALUES (?, ?)',
        [name, description]
      );
      categoryId = result.insertId;
    }

    res.status(201).json({ message: 'Tạo danh mục thành công', categoryId });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi tạo danh mục', error: err });
  }
};

// Cập nhật danh mục
const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE categories SET name = ?, description = ? WHERE id = ?',
      [name, description, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Danh mục không tìm thấy' });
    res.json({ message: 'Cập nhật danh mục thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi cập nhật danh mục', error: err });
  }
};

// Xoá danh mục (và lưu lại ID)
const deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    // Kiểm tra tồn tại
    const [check] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
    if (check.length === 0) return res.status(404).json({ message: 'Danh mục không tìm thấy' });

    // Lưu ID lại
    await db.query('INSERT INTO deleted_category_ids (id) VALUES (?)', [id]);

    // Xoá danh mục
    await db.query('DELETE FROM categories WHERE id = ?', [id]);

    res.json({ message: 'Xoá danh mục thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi xoá danh mục', error: err });
  }
};

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
