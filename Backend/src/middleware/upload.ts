import multer from "multer";

// Keep each batch below the serverless memory and execution envelope.
export const uploadLimits = {
  fileSize: 8 * 1024 * 1024,
  files: 3,
} as const;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: uploadLimits,
  fileFilter: (req, file, cb) => {
    const allowed = /^image\/(jpeg|jpg|png|gif|webp)$/i.test(file.mimetype);
    if (allowed) cb(null, true);
    else cb(new Error("Chỉ chấp nhận ảnh: JPEG, PNG, GIF, WebP"));
  },
});

export default upload;
