import express from "express";
const router = express.Router();
import * as studioController from "../controllers/studioController";
import authenticateToken from "../middleware/auth";
import {  readLimiter  } from "../middleware/rateLimiter";

router.get('/comics', readLimiter, authenticateToken, studioController.getStudioComics);

export default router;

