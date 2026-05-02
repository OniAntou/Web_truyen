const express = require('express');
const router = express.Router();
const { createPayment, vnpayReturn, vnpayIpn } = require('../controllers/paymentController');
const auth = require('../middleware/auth');
const { paymentLimiter } = require('../middleware/rateLimiter');

// Create payment URL (Requires authentication)
router.post('/create', paymentLimiter, auth, createPayment);

// Handle browser redirect from VNPay (no rate limit - callback from payment gateway)
router.get('/vnpay_return', vnpayReturn);

// Handle background notification from VNPay (no rate limit - callback from payment gateway)
router.get('/vnpay_ipn', vnpayIpn);

module.exports = router;

