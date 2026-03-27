const multer = require('multer');

// Multer: lưu file trong memory để gửi lên R2
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = /^image\/(jpeg|jpg|png|gif|webp)$/i.test(file.mimetype);
    if (allowed) cb(null, true);
    else cb(new Error("Chỉ chấp nhận ảnh: JPEG, PNG, GIF, WebP"));
  },
});

module.exports = upload;
