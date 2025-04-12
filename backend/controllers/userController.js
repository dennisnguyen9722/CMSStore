const fs = require('fs');
const path = require('path');  // Thêm dòng này để import module path
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const multer = require("multer");

// Lấy tất cả người dùng
const getAllUsers = async (req, res) => {
  try {
    // Cập nhật truy vấn để lấy cả avatar của người dùng
    const [results] = await db.query('SELECT id, name, email, role, avatar FROM users');
    
    // Trả về kết quả với các thông tin cần thiết
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

// Cấu hình multer để lưu file ảnh
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);  // Sử dụng path.extname
    const filename = Date.now() + ext;
    cb(null, filename);
  },
});

const upload = multer({ storage });

// Cập nhật người dùng
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;
    let avatar = null;

    // Lấy thông tin người dùng cũ
    const [userResults] = await db.query('SELECT avatar FROM users WHERE id = ?', [id]);

    // Nếu có ảnh cũ, xoá đi trước khi lưu ảnh mới
    if (userResults.length > 0 && userResults[0].avatar) {
      const oldAvatar = userResults[0].avatar;
      const oldAvatarPath = path.join(__dirname, '..', oldAvatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);  // Xoá ảnh cũ
      }
    }

    // Kiểm tra nếu có ảnh mới
    if (req.file) {
      avatar = `/uploads/${req.file.filename}`;
    }

    // Cập nhật thông tin người dùng và ảnh mới (nếu có)
    await db.query('UPDATE users SET name = ?, email = ?, role = ?, avatar = ? WHERE id = ?', 
    [name, email, role, avatar || null, id]);

    res.json({ message: 'Cập nhật thành công' });
  } catch (err) {
    console.error("Lỗi khi cập nhật người dùng:", err);
    res.status(500).json({ message: 'Lỗi cập nhật', error: err.message });
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

// Lấy thông tin người dùng hiện tại từ token
const getMe = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Token không hợp lệ" });

    const [rows] = await db.query("SELECT id, name, email, role, avatar FROM users WHERE id = ?", [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Lỗi getMe:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

const changePassword = async (req, res) => {
  const userId = req.user.id; // user đã đăng nhập (lấy từ middleware xác thực)
  const { oldPassword, newPassword } = req.body;

  try {
    const [rows] = await db.query("SELECT password FROM users WHERE id = ?", [userId]);
    const user = rows[0];

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Mật khẩu cũ không đúng" });

    const hashedNew = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE users SET password = ? WHERE id = ?", [hashedNew, userId]);

    res.json({ message: "Đổi mật khẩu thành công" });
  } catch (error) {
    console.error("Lỗi đổi mật khẩu:", error);
    res.status(500).json({ message: "Đổi mật khẩu thất bại" });
  }
};

module.exports = {
  getMe,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
  upload
};
