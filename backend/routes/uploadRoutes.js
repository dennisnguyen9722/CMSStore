const express = require('express');
const multer = require('multer');
const { uploadDescriptionImage } = require('../controllers/uploadController');

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // lưu vào thư mục uploads/
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

router.post('/description-image', upload.single('image'), uploadDescriptionImage);

module.exports = router;
