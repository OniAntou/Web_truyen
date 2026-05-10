import express from "express";
const router = express.Router();
import * as adminUserController from "../controllers/adminUserController";
import authenticateToken, { requireAdmin } from "../middleware/auth";
import {  adminLimiter  } from "../middleware/rateLimiter";

router.use(adminLimiter);

router.get('/', authenticateToken, requireAdmin, adminUserController.getAllUsers);
router.get('/:id', authenticateToken, requireAdmin, adminUserController.getUserById);
router.put('/:id', authenticateToken, requireAdmin, adminUserController.updateUser);
router.delete('/:id', authenticateToken, requireAdmin, adminUserController.adminDeleteUser);

export default router;

