const express = require('express');
const router = express.Router();
const chapterController = require('../controllers/chapterController');
const optionalAuth = require('../middleware/optionalAuth');
const auth = require('../middleware/auth');

router.get('/:chapterId/pages', optionalAuth, chapterController.getChapterPages);
router.post('/:chapterId/unlock', auth, chapterController.unlockChapter);
router.put('/:chapterId/reorder-pages', auth, chapterController.reorderPages);
router.post('/', auth, chapterController.createChapter);
router.delete('/:id', auth, chapterController.deleteChapter);
router.post('/bulk-delete', auth, chapterController.bulkDeleteChapters);
router.delete('/:chapterId/pages/:pageId', auth, chapterController.deletePage);

module.exports = router;
