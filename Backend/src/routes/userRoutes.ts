import express from "express";
const router = express.Router();
import * as userController from "../controllers/userController";
import * as interactionController from "../controllers/interactionController";
import authenticateToken from "../middleware/auth";
import {  readLimiter, writeLimiter  } from "../middleware/rateLimiter";

router.get('/me', readLimiter, authenticateToken, userController.getMe);
router.put('/me', writeLimiter, authenticateToken, userController.updateMe);
router.delete('/me', writeLimiter, authenticateToken, userController.deleteMe);
router.get('/transactions', readLimiter, authenticateToken, userController.getTransactions);
router.delete('/:id', writeLimiter, userController.deleteUser);

// Interactions
router.get('/favorites', readLimiter, authenticateToken, interactionController.getUserFavorites);
router.get('/reading-progress', readLimiter, authenticateToken, interactionController.getAllReadingProgress);

// VIP
router.post('/upgrade-vip', writeLimiter, authenticateToken, userController.upgradeVip);

export default router;

