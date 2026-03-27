const express = require('express');
const router = express.Router();
const chapterController = require('../controllers/chapterController');

router.get('/:chapterId/pages', chapterController.getChapterPages);
router.put('/:chapterId/reorder-pages', chapterController.reorderPages);
router.post('/', chapterController.createChapter);
router.delete('/:id', chapterController.deleteChapter);
router.post('/bulk-delete', chapterController.bulkDeleteChapters);
router.delete('/:chapterId/pages/:pageId', chapterController.deletePage);

module.exports = router;
