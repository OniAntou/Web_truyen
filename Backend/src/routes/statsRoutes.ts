import express from "express";
const router = express.Router();
import * as statsController from "../controllers/statsController";
import authenticateToken, { requireAdmin } from "../middleware/auth";
import {  adminLimiter  } from "../middleware/rateLimiter";

router.get('/', adminLimiter, authenticateToken, requireAdmin, statsController.getStats);

export default router;

