const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const uploadMiddleware = require('../middleware/upload');

router.get('/r2/status', uploadController.getR2Status);
router.get('/media/signed-url', uploadController.getSignedUrl);
router.post('/cover/:comicId', uploadMiddleware.single('cover'), uploadController.uploadCover);
router.post('/chapter/:chapterId', uploadMiddleware.array('pages', 50), uploadController.uploadChapterPages);

module.exports = router;
