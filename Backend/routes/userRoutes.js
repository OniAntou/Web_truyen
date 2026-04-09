const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const interactionController = require('../controllers/interactionController');
const authenticateToken = require('../middleware/auth');

router.get('/me', authenticateToken, userController.getMe);
router.put('/me', authenticateToken, userController.updateMe);
router.delete('/me', authenticateToken, userController.deleteMe);
router.get('/transactions', authenticateToken, userController.getTransactions);
router.delete('/:id', userController.deleteUser);

// Interactions
router.get('/favorites', authenticateToken, interactionController.getUserFavorites);
router.get('/reading-progress', authenticateToken, interactionController.getAllReadingProgress);

// VIP
router.post('/upgrade-vip', authenticateToken, userController.upgradeVip);

module.exports = router;
