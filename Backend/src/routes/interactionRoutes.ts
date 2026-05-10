import express from "express";
const router = express.Router();
import * as interactionController from "../controllers/interactionController";
import authenticateToken from "../middleware/auth";
import {  interactionLimiter, readLimiter  } from "../middleware/rateLimiter";

// Ratings
router.get('/:id/user-rating', readLimiter, authenticateToken, interactionController.getUserRating);
router.post('/:id/rate', interactionLimiter, authenticateToken, interactionController.submitRating);

// Views
router.post('/:id/view', interactionLimiter, authenticateToken, interactionController.recordView);

// Comments
router.get('/:id/comments', readLimiter, interactionController.getComments);
router.post('/:id/comments', interactionLimiter, authenticateToken, interactionController.postComment);
router.delete('/:id/comments/:commentId', interactionLimiter, authenticateToken, interactionController.deleteComment);

// Favorites
router.get('/:id/favorite', readLimiter, authenticateToken, interactionController.checkFavorite);
router.post('/:id/favorite', interactionLimiter, authenticateToken, interactionController.toggleFavorite);

// Reading Progress
router.get('/:id/reading-progress', readLimiter, authenticateToken, interactionController.getReadingProgress);
router.post('/:id/reading-progress', interactionLimiter, authenticateToken, interactionController.updateReadingProgress);
router.get('/:id/chapters/read-status', readLimiter, authenticateToken, interactionController.getChapterReadStatus);

export default router;

