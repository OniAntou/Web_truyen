import express from "express";
const router = express.Router();
import * as authController from "../controllers/authController";
import validateRequest from "../middleware/validateRequest";
import {  registerSchema, loginSchema, adminLoginSchema  } from "../utils/authValidation";
import {  authLimiter  } from "../middleware/rateLimiter";

router.post('/admin/login', authLimiter, validateRequest(adminLoginSchema), authController.adminLogin);
router.post('/register', authLimiter, validateRequest(registerSchema), authController.register);
router.post('/login', authLimiter, validateRequest(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.post('/admin/logout', authController.adminLogout);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password/:token', authLimiter, authController.resetPassword);

export default router;

