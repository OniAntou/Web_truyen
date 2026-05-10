import express from "express";
const router = express.Router();
import * as adminCommentController from "../controllers/adminCommentController";
import authenticateToken, { requireAdmin } from "../middleware/auth";
import {  adminLimiter  } from "../middleware/rateLimiter";

router.use(adminLimiter);

// Bulk delete MUST come before /:id to avoid route conflict
router.delete('/bulk', authenticateToken, requireAdmin, adminCommentController.bulkDeleteComments);
router.get('/', authenticateToken, requireAdmin, adminCommentController.getAllComments);
router.get('/comics', authenticateToken, requireAdmin, adminCommentController.getComicsForFilter);
router.delete('/:id', authenticateToken, requireAdmin, adminCommentController.deleteComment);

export default router;

