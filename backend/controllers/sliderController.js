const db = require('../config/db');
const fs = require('fs');
const path = require('path');

exports.getSliders = async (req, res) => {
  try {
    const result = await db.execute('SELECT * FROM sliders');

    const sliderRows = result[0]; // Trích rows đúng cách

    for (const slider of sliderRows) {
      const [imageRows] = await db.execute(
        'SELECT image_path, link FROM slider_images WHERE slider_id = ?',
        [slider.id]
      );
      slider.images = imageRows;
    }

    res.status(200).json(sliderRows);
  } catch (err) {
    console.error('🔥 Lỗi tại getSliders:', err);
    res.status(500).json({ error: 'Lỗi server khi lấy danh sách slider' });
  }
};

exports.createSlider = async (req, res) => {
  try {
    const { title, links } = req.body;
    const files = req.files;

    const [result] = await db.execute('INSERT INTO sliders (title) VALUES (?)', [title]);
    const sliderId = result.insertId;

    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const image = files[i];
        const link = links && links[i] ? links[i] : '';
        await db.execute(
          'INSERT INTO slider_images (slider_id, image_path, link) VALUES (?, ?, ?)',
          [sliderId, image.filename, link]
        );
      }
    }

    res.status(201).json({ message: 'Thêm slider thành công' });
  } catch (err) {
    console.error('🔥 Lỗi tại createSlider:', err);
    res.status(500).json({ error: 'Lỗi server khi thêm slider' });
  }
};

exports.updateSlider = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, links, keptOldImages } = req.body;
    const files = req.files;

    const kept = keptOldImages ? JSON.parse(keptOldImages) : [];

    await db.execute('UPDATE sliders SET title = ? WHERE id = ?', [title, id]);

    // Lấy danh sách ảnh hiện tại
    const [currentImages] = await db.execute(
      'SELECT * FROM slider_images WHERE slider_id = ?',
      [id]
    );

    // Xác định ảnh cần xoá
    const imagesToDelete = currentImages.filter(
      (img) => !kept.includes(img.image_path)
    );

    for (let img of imagesToDelete) {
      const filePath = path.join(__dirname, '../uploads', img.image_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      await db.execute(
        'DELETE FROM slider_images WHERE slider_id = ? AND image_path = ?',
        [id, img.image_path]
      );
    }

    // Thêm ảnh mới nếu có
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const image = files[i];
        const link = links && links[i] ? links[i] : '';
        await db.execute(
          'INSERT INTO slider_images (slider_id, image_path, link) VALUES (?, ?, ?)',
          [id, image.filename, link]
        );
      }
    }

    res.json({ message: 'Cập nhật slider thành công' });
  } catch (err) {
    console.error('🔥 Lỗi tại updateSlider:', err);
    res.status(500).json({ error: 'Lỗi server khi cập nhật slider' });
  }
};

exports.deleteSlider = async (req, res) => {
  try {
    const { id } = req.params;

    // Xoá ảnh vật lý
    const [images] = await db.execute(
      'SELECT image_path FROM slider_images WHERE slider_id = ?',
      [id]
    );

    for (let img of images) {
      const filePath = path.join(__dirname, '../uploads', img.image_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await db.execute('DELETE FROM slider_images WHERE slider_id = ?', [id]);
    await db.execute('DELETE FROM sliders WHERE id = ?', [id]);

    res.json({ message: 'Xoá slider thành công' });
  } catch (err) {
    console.error('🔥 Lỗi tại deleteSlider:', err);
    res.status(500).json({ error: 'Lỗi server khi xoá slider' });
  }
};