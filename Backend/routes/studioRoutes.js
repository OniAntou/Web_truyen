const express = require('express');
const router = express.Router();
const studioController = require('../controllers/studioController');
const authenticateToken = require('../middleware/auth');

router.get('/comics', authenticateToken, studioController.getStudioComics);

module.exports = router;
