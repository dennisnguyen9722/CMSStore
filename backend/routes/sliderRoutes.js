const express = require('express');
const router = express.Router();
const sliderController = require('../controllers/sliderController');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/sliders/'); // <-- sửa đúng thư mục
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.get('/', sliderController.getSliders);
router.post('/', upload.array('images'), sliderController.createSlider);
router.put('/:id', upload.array('images'), sliderController.updateSlider);
router.delete('/:id', sliderController.deleteSlider);

module.exports = router;
