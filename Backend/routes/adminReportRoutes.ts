import express from "express";
const router = express.Router();
import * as adminReportController from "../controllers/adminReportController";
import authenticateToken from "../middleware/auth";
import {  adminLimiter  } from "../middleware/rateLimiter";

const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: "Bạn không có quyền truy cập" });
    }
    next();
};

router.use(authenticateToken);
router.use(requireAdmin);
router.use(adminLimiter);

router.get('/', adminReportController.getAllReports);
router.patch('/:id/status', adminReportController.updateReportStatus);
router.delete('/:id', adminReportController.deleteReport);

export default router;

