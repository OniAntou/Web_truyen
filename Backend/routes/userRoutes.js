const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const interactionController = require('../controllers/interactionController');
const authenticateToken = require('../middleware/auth');

router.get('/me', authenticateToken, userController.getMe);
router.delete('/me', authenticateToken, userController.deleteMe);
router.delete('/:id', userController.deleteUser);

// Interactions
router.get('/favorites', authenticateToken, interactionController.getUserFavorites);
router.get('/reading-progress', authenticateToken, interactionController.getAllReadingProgress);

module.exports = router;
