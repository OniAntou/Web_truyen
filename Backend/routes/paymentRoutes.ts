import express from "express";
const router = express.Router();
import {  createPayment, vnpayReturn, vnpayIpn  } from "../controllers/paymentController";
import auth from "../middleware/auth";
import {  paymentLimiter  } from "../middleware/rateLimiter";

// Create payment URL (Requires authentication)
router.post('/create', paymentLimiter, auth, createPayment);

// Handle browser redirect from VNPay (no rate limit - callback from payment gateway)
router.get('/vnpay_return', vnpayReturn);

// Handle background notification from VNPay (no rate limit - callback from payment gateway)
router.get('/vnpay_ipn', vnpayIpn);

export default router;

