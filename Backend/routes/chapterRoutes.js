const express = require('express');
const router = express.Router();
const chapterController = require('../controllers/chapterController');
const optionalAuth = require('../middleware/optionalAuth');
const auth = require('../middleware/auth');
const { readLimiter, writeLimiter } = require('../middleware/rateLimiter');

router.get('/:chapterId/pages', readLimiter, optionalAuth, chapterController.getChapterPages);
router.post('/:chapterId/unlock', writeLimiter, auth, chapterController.unlockChapter);
router.put('/:chapterId/reorder-pages', writeLimiter, auth, chapterController.reorderPages);
router.post('/', writeLimiter, auth, chapterController.createChapter);
router.delete('/:id', writeLimiter, auth, chapterController.deleteChapter);
router.post('/bulk-delete', writeLimiter, auth, chapterController.bulkDeleteChapters);
router.delete('/:chapterId/pages/:pageId', writeLimiter, auth, chapterController.deletePage);

module.exports = router;

