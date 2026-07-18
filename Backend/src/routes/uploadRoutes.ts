import express from "express";
const router = express.Router();
import * as uploadController from "../controllers/uploadController";
import uploadMiddleware from "../middleware/upload";
import auth from "../middleware/auth";
import {  uploadLimiter, readLimiter  } from "../middleware/rateLimiter";

const UPLOAD_TIMEOUT_MS = 5 * 60 * 1000;

// Match the Vercel Function budget configured in vercel.json.
const setUploadTimeout = (req, res, next) => {
  req.setTimeout(UPLOAD_TIMEOUT_MS);
  res.setTimeout(UPLOAD_TIMEOUT_MS);
  next();
};

router.get('/r2/status', readLimiter, uploadController.getR2Status);
router.get('/media/signed-url', readLimiter, auth, uploadController.getSignedUrl);
router.post('/cover/:comicId', uploadLimiter, auth, uploadMiddleware.single('cover'), uploadController.uploadCover);
router.post('/chapter/:chapterId', uploadLimiter, auth, setUploadTimeout, uploadMiddleware.array('pages', 5), uploadController.uploadChapterPages);
router.post('/avatar', uploadLimiter, auth, uploadMiddleware.single('avatar'), uploadController.uploadAvatar);

export default router;
export { UPLOAD_TIMEOUT_MS };
