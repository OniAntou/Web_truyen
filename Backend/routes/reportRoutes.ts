import express from "express";
const router = express.Router();
import * as reportController from "../controllers/reportController";
import authenticateToken from "../middleware/auth";
import {  reportLimiter, readLimiter  } from "../middleware/rateLimiter";

router.use(authenticateToken);

router.post('/', reportLimiter, reportController.createReport);
router.get('/my', readLimiter, reportController.getMyReports);

export default router;

