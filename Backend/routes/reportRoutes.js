const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authenticateToken = require('../middleware/auth');

router.use(authenticateToken);

router.post('/', reportController.createReport);
router.get('/my', reportController.getMyReports);

module.exports = router;
