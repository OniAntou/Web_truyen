const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { adminLimiter } = require('../middleware/rateLimiter');

router.get('/', adminLimiter, statsController.getStats);

module.exports = router;

