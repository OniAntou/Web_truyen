import express from "express";
const router = express.Router();
import * as statsController from "../controllers/statsController";
import {  adminLimiter  } from "../middleware/rateLimiter";

router.get('/', adminLimiter, statsController.getStats);

export default router;

