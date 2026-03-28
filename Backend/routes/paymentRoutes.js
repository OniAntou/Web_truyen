const express = require('express');
const router = express.Router();
const { createPayment, vnpayReturn, vnpayIpn } = require('../controllers/paymentController');
const auth = require('../middleware/auth');

// Create payment URL (Requires authentication)
router.post('/create', auth, createPayment);

// Handle browser redirect from VNPay
router.get('/vnpay_return', vnpayReturn);

// Handle background notification from VNPay
router.get('/vnpay_ipn', vnpayIpn);

module.exports = router;
