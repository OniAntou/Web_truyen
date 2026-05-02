const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validateRequest = require('../middleware/validateRequest');
const { registerSchema, loginSchema, adminLoginSchema } = require('../utils/authValidation');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/admin/login', authLimiter, validateRequest(adminLoginSchema), authController.adminLogin);
router.post('/register', authLimiter, validateRequest(registerSchema), authController.register);
router.post('/login', authLimiter, validateRequest(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.post('/admin/logout', authController.adminLogout);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password/:token', authLimiter, authController.resetPassword);

module.exports = router;

