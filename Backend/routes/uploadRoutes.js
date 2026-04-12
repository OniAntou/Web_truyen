const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const uploadMiddleware = require('../middleware/upload');

// Middleware to set request timeout for chapter uploads (5 minutes for large batches)
const setUploadTimeout = (req, res, next) => {
  req.setTimeout(5 * 60 * 1000); // 5 minutes
  res.setTimeout(5 * 60 * 1000);
  next();
};

router.get('/r2/status', uploadController.getR2Status);
router.get('/media/signed-url', uploadController.getSignedUrl);
router.post('/cover/:comicId', uploadMiddleware.single('cover'), uploadController.uploadCover);
router.post('/chapter/:chapterId', setUploadTimeout, uploadMiddleware.array('pages', 200), uploadController.uploadChapterPages);

module.exports = router;
