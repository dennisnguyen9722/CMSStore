const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const productController = require('../controllers/productController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads'); // Thư mục gốc của dự án
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    const unique = `${name}-${Date.now()}${ext}`;
    cb(null, unique);
  },
});

const upload = multer({ storage });

router.get('/', productController.getAllProducts);
router.post('/', upload.array('images'), productController.createProduct);
router.put('/:id', upload.array('images'), productController.updateProduct);
router.put('/:id/featured', productController.updateFeaturedStatus);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
