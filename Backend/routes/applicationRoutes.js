const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const authenticateToken = require('../middleware/auth');
const { writeLimiter, adminLimiter } = require('../middleware/rateLimiter');

router.post('/', writeLimiter, authenticateToken, applicationController.submitApplication);
router.get('/admin', adminLimiter, applicationController.getApplications);
router.put('/admin/:id/status', adminLimiter, applicationController.updateApplicationStatus);
router.delete('/admin/:id', adminLimiter, applicationController.deleteApplication);

module.exports = router;

