const express = require('express');
const router = express.Router();
const adminCommentController = require('../controllers/adminCommentController');
const authenticateToken = require('../middleware/auth');

// All routes require admin authentication
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: "Bạn không có quyền truy cập" });
  }
  next();
};

// Bulk delete MUST come before /:id to avoid route conflict
router.delete('/bulk', authenticateToken, requireAdmin, adminCommentController.bulkDeleteComments);
router.get('/', authenticateToken, requireAdmin, adminCommentController.getAllComments);
router.get('/comics', authenticateToken, requireAdmin, adminCommentController.getComicsForFilter);
router.delete('/:id', authenticateToken, requireAdmin, adminCommentController.deleteComment);

module.exports = router;
