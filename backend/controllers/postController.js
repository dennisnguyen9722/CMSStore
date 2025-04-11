const pool = require("../config/db");
const fs = require("fs");
const path = require("path");

exports.getAllPosts = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM posts ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error("Lỗi getAllPosts:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM posts WHERE id = ?", [
      req.params.id,
    ]);
    if (rows.length === 0) return res.status(404).json({ error: "Không tìm thấy bài viết" });
    res.json(rows[0]);
  } catch (err) {
    console.error("Lỗi getPostById:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
};

exports.createPost = async (req, res) => {
  try {
    const { title, seo_description, content, seo_keywords } = req.body;
    const thumbnail = req.file ? `/uploads/${req.file.filename}` : null;

    const [result] = await pool.query(
      "INSERT INTO posts (title, seo_description, content, seo_keywords, thumbnail) VALUES (?, ?, ?, ?, ?)",
      [title, seo_description, content, seo_keywords, thumbnail]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error("Lỗi createPost:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, seo_description, content, seo_keywords, oldImagePath } = req.body;
    let thumbnail = oldImagePath;

    if (req.file) {
      thumbnail = `/uploads/${req.file.filename}`;
      // Xoá ảnh cũ nếu tồn tại
      if (oldImagePath && fs.existsSync(path.join(__dirname, "..", oldImagePath))) {
        fs.unlinkSync(path.join(__dirname, "..", oldImagePath));
      }
    }

    await pool.query(
      "UPDATE posts SET title=?, seo_description=?, content=?, seo_keywords=?, thumbnail=? WHERE id=?",
      [title, seo_description, content, seo_keywords, thumbnail, id]
    );

    res.json({ message: "Cập nhật bài viết thành công" });
  } catch (err) {
    console.error("Lỗi updatePost:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query("SELECT thumbnail FROM posts WHERE id = ?", [id]);
    if (rows.length > 0 && rows[0].thumbnail) {
      const imagePath = path.join(__dirname, "..", rows[0].thumbnail);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await pool.query("DELETE FROM posts WHERE id = ?", [id]);

    res.json({ message: "Xoá bài viết thành công" });
  } catch (err) {
    console.error("Lỗi deletePost:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
};
