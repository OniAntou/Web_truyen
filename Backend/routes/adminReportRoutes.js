const express = require('express');
const router = express.Router();
const adminReportController = require('../controllers/adminReportController');
const authenticateToken = require('../middleware/auth');

const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: "Bạn không có quyền truy cập" });
    }
    next();
};

router.use(authenticateToken);
router.use(requireAdmin);

router.get('/', adminReportController.getAllReports);
router.patch('/:id/status', adminReportController.updateReportStatus);
router.delete('/:id', adminReportController.deleteReport);

module.exports = router;
