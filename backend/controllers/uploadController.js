const path = require('path');

const uploadDescriptionImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Không có file được upload' });
  }

  const filePath = `/uploads/${req.file.filename}`;
  return res.status(200).json({ url: filePath });
};

module.exports = {
  uploadDescriptionImage,
};
