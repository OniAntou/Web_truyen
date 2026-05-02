import express from "express";
const router = express.Router();
import * as uploadController from "../controllers/uploadController";
import uploadMiddleware from "../middleware/upload";
import auth from "../middleware/auth";
import {  uploadLimiter, readLimiter  } from "../middleware/rateLimiter";

// Middleware to set request timeout for chapter uploads (5 minutes for large batches)
const setUploadTimeout = (req, res, next) => {
  req.setTimeout(5 * 60 * 1000); // 5 minutes
  res.setTimeout(5 * 60 * 1000);
  next();
};

router.get('/r2/status', readLimiter, uploadController.getR2Status);
router.get('/media/signed-url', readLimiter, uploadController.getSignedUrl);
router.post('/cover/:comicId', uploadLimiter, auth, uploadMiddleware.single('cover'), uploadController.uploadCover);
router.post('/chapter/:chapterId', uploadLimiter, auth, setUploadTimeout, uploadMiddleware.array('pages', 200), uploadController.uploadChapterPages);

export default router;

