import express from "express";
const router = express.Router();
import * as chapterController from "../controllers/chapterController";
import optionalAuth from "../middleware/optionalAuth";
import auth from "../middleware/auth";
import {  readLimiter, writeLimiter  } from "../middleware/rateLimiter";

router.get('/:chapterId/pages', readLimiter, optionalAuth, chapterController.getChapterPages);
router.post('/:chapterId/unlock', writeLimiter, auth, chapterController.unlockChapter);
router.put('/:chapterId/reorder-pages', writeLimiter, auth, chapterController.reorderPages);
router.post('/', writeLimiter, auth, chapterController.createChapter);
router.delete('/:id', writeLimiter, auth, chapterController.deleteChapter);
router.post('/bulk-delete', writeLimiter, auth, chapterController.bulkDeleteChapters);
router.delete('/:chapterId/pages/:pageId', writeLimiter, auth, chapterController.deletePage);

export default router;

