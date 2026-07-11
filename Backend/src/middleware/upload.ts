import multer from "multer";

// Multer: lưu file trong memory để gửi lên R2
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 5 }, // 10MB per image, 5 files per request
  fileFilter: (req, file, cb) => {
    const allowed = /^image\/(jpeg|jpg|png|gif|webp)$/i.test(file.mimetype);
    if (allowed) cb(null, true);
    else cb(new Error("Chỉ chấp nhận ảnh: JPEG, PNG, GIF, WebP"));
  },
});

export default upload;
