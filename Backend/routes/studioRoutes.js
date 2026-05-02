const express = require('express');
const router = express.Router();
const studioController = require('../controllers/studioController');
const authenticateToken = require('../middleware/auth');
const { readLimiter } = require('../middleware/rateLimiter');

router.get('/comics', readLimiter, authenticateToken, studioController.getStudioComics);

module.exports = router;

