import express from "express";
const router = express.Router();
import * as auditLogController from "../controllers/auditLogController";
import authenticateToken, { requireAdmin } from "../middleware/auth";
import { adminLimiter } from "../middleware/rateLimiter";

router.get('/', adminLimiter, authenticateToken, requireAdmin, auditLogController.getAuditLogs);

export default router;
