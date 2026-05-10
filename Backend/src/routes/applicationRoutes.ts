import express from "express";
const router = express.Router();
import * as applicationController from "../controllers/applicationController";
import authenticateToken from "../middleware/auth";
import {  writeLimiter, adminLimiter  } from "../middleware/rateLimiter";

router.post('/', writeLimiter, authenticateToken, applicationController.submitApplication);
router.get('/admin', adminLimiter, applicationController.getApplications);
router.put('/admin/:id/status', adminLimiter, applicationController.updateApplicationStatus);
router.delete('/admin/:id', adminLimiter, applicationController.deleteApplication);

export default router;

