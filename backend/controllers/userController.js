const db = require('../config/db');
const bcrypt = require('bcryptjs');

// Lấy tất cả người dùng
const getAllUsers = async (req, res) => {
  try {
    const [results] = await db.query('SELECT id, name, email, role FROM users');
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err });
  }
};

// Lấy thông tin người dùng theo ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const [results] = await db.query('SELECT id, name, email, role FROM users WHERE id = ?', [id]);
    if (results.length === 0) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err });
  }
};

// Tạo người dùng mới
const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role || 'staff']
    );
    res.status(201).json({ message: 'Tạo người dùng thành công', userId: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi tạo người dùng', error: err });
  }
};

// Cập nhật người dùng
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;
    await db.query('UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?', [name, email, role, id]);
    res.json({ message: 'Cập nhật thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi cập nhật', error: err });
  }
};

// Xoá người dùng
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'Xoá thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi xoá người dùng', error: err });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
