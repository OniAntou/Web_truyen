const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const interactionController = require('../controllers/interactionController');
const authenticateToken = require('../middleware/auth');
const { readLimiter, writeLimiter } = require('../middleware/rateLimiter');

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

module.exports = router;

