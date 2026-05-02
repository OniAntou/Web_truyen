const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authenticateToken = require('../middleware/auth');
const { reportLimiter, readLimiter } = require('../middleware/rateLimiter');

router.use(authenticateToken);

router.post('/', reportLimiter, reportController.createReport);
router.get('/my', readLimiter, reportController.getMyReports);

module.exports = router;

