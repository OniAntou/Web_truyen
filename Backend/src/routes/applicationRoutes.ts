import express from "express";
const router = express.Router();
import * as applicationController from "../controllers/applicationController";
import authenticateToken, { requireAdmin } from "../middleware/auth";
import {  writeLimiter, adminLimiter  } from "../middleware/rateLimiter";

router.post('/', writeLimiter, authenticateToken, applicationController.submitApplication);
router.get('/admin', adminLimiter, authenticateToken, requireAdmin, applicationController.getApplications);
router.put('/admin/:id/status', adminLimiter, authenticateToken, requireAdmin, applicationController.updateApplicationStatus);
router.delete('/admin/:id', adminLimiter, authenticateToken, requireAdmin, applicationController.deleteApplication);

export default router;

