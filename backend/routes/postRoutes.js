const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
} = require("../controllers/postController");

// Cấu hình Multer để upload ảnh đại diện bài viết
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // đảm bảo thư mục này tồn tại
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// ROUTES
router.get("/", getAllPosts);
router.get("/:id", getPostById);
router.post("/", upload.single("thumbnail"), createPost);
router.put("/:id", upload.single("thumbnail"), updatePost);
router.delete("/:id", deletePost);

module.exports = router;
