const express = require('express');
const router = express.Router();
const interactionController = require('../controllers/interactionController');
const authenticateToken = require('../middleware/auth');

// Ratings
router.get('/:id/user-rating', authenticateToken, interactionController.getUserRating);
router.post('/:id/rate', authenticateToken, interactionController.submitRating);

// Views
router.post('/:id/view', authenticateToken, interactionController.recordView);

// Comments
router.get('/:id/comments', interactionController.getComments);
router.post('/:id/comments', authenticateToken, interactionController.postComment);
router.delete('/:id/comments/:commentId', authenticateToken, interactionController.deleteComment);

// Favorites
router.get('/:id/favorite', authenticateToken, interactionController.checkFavorite);
router.post('/:id/favorite', authenticateToken, interactionController.toggleFavorite);

// Reading Progress
router.get('/:id/reading-progress', authenticateToken, interactionController.getReadingProgress);
router.post('/:id/reading-progress', authenticateToken, interactionController.updateReadingProgress);
router.get('/:id/chapters/read-status', authenticateToken, interactionController.getChapterReadStatus);

module.exports = router;
