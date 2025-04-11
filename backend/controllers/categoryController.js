const db = require('../config/db');

const getAllCategories = async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM categories');
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy danh mục', error: err });
  }
};

const createCategory = async (req, res) => {
  const { name, description } = req.body;
  try {
    const [result] = await db.query('INSERT INTO categories (name, description) VALUES (?, ?)', [name, description]);
    res.status(201).json({ message: 'Tạo danh mục thành công', categoryId: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi tạo danh mục', error: err });
  }
};

const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  try {
    const [result] = await db.query('UPDATE categories SET name = ?, description = ? WHERE id = ?', [name, description, id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Danh mục không tìm thấy' });
    res.json({ message: 'Cập nhật danh mục thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi cập nhật danh mục', error: err });
  }
};

const deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM categories WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Danh mục không tìm thấy' });
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
