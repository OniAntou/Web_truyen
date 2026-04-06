const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const authenticateToken = require('../middleware/auth');

router.post('/', authenticateToken, applicationController.submitApplication);
router.get('/admin', applicationController.getApplications);
router.put('/admin/:id/status', applicationController.updateApplicationStatus);
router.delete('/admin/:id', applicationController.deleteApplication);

module.exports = router;
