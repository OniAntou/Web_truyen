const express = require('express');
const router = express.Router();
const adminUserController = require('../controllers/adminUserController');
const authenticateToken = require('../middleware/auth');

// All routes require admin authentication
// The authenticateToken middleware verifies the JWT; the admin check is
// done by verifying that the token was issued with role: 'admin'.
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: "Bạn không có quyền truy cập" });
  }
  next();
};

router.get('/', authenticateToken, requireAdmin, adminUserController.getAllUsers);
router.get('/:id', authenticateToken, requireAdmin, adminUserController.getUserById);
router.put('/:id', authenticateToken, requireAdmin, adminUserController.updateUser);
router.delete('/:id', authenticateToken, requireAdmin, adminUserController.adminDeleteUser);

module.exports = router;
