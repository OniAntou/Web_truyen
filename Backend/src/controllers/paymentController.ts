import {  Payment, User  } from "../database";
import * as vnpay from "../utils/vnpay";
import asyncHandler from "../middleware/asyncHandler";
import AppError from "../utils/AppError";

/**
 * Handle VNPay Payments
 */
const createPayment = asyncHandler(async (req, res) => {
  const { amount, bankCode, locale } = req.body;
  const userId = req.user.id; // From auth middleware

  if (!amount || amount < 5000) {
    throw new AppError("Số tiền tối thiểu là 5,000 VNĐ", 400);
  }

  const orderId = `PAY_${Date.now()}`;
  const orderInfo = `Nap Linh thach cho user ${userId}`;

  console.log(`[Payment] Creating payment for user ${userId}, amount ${amount}`);
  
  // 1. Generate payment URL
  const paymentUrl = vnpay.createPaymentUrl({
    amount,
    orderId,
    orderInfo,
    bankCode,
    locale,
    ipAddr: req.ip || "127.0.0.1",
  });

  // 2. Create pending transaction in DB
  await Payment.create({
    user_id: userId,
    amount,
    description: orderInfo,
    order_id: orderId,
    status: "pending",
  });

  res.json({ paymentUrl });
});

/**
 * Handle VNPay Return URL (Browser redirect)
 */
const vnpayReturn = asyncHandler(async (req, res) => {
  let vnp_Params = req.query;
  const isValid = vnpay.verifyReturnUrl({ ...vnp_Params });

  if (!isValid) {
    return res.status(200).json({ success: false, message: "Checksum failed" });
  }

  const orderId = vnp_Params["vnp_TxnRef"];
  const responseCode = vnp_Params["vnp_ResponseCode"];
  const vnp_TransactionNo = vnp_Params["vnp_TransactionNo"];

  const payment = await Payment.findOneAndUpdate(
    { order_id: String(orderId), status: "pending" },
    {
      $set: {
        status: responseCode === "00" ? "success" : "failed",
        vnp_transaction_no: vnp_TransactionNo,
        vnp_response_code: responseCode,
        updated_at: new Date()
      }
    },
    { new: true }
  );

  if (!payment) {
    // If not found, it might have been processed already or order id is invalid
    const existing = await Payment.findOne({ order_id: String(orderId) });
    if (existing && existing.status !== "pending") {
       return res.json({ success: true, message: "Giao dịch đã được xử lý trước đó" });
    }
    return res.status(200).json({ success: false, message: "Order not found or already processed" });
  }

  if (responseCode === "00") {
    // Update user coins (Conversion: 1,000 VND = 100 Coins)
    const coinsToAdd = Math.floor(payment.amount / 1000) * 100;
    await User.findByIdAndUpdate(payment.user_id, {
      $inc: { coins: coinsToAdd },
    });
    
    return res.json({ success: true, message: "Thanh toán thành công" });
  } else {
    return res.json({ success: false, message: "Thanh toán thất bại", code: responseCode });
  }
});

/**
 * Handle VNPay IPN (Background notification)
 */
const vnpayIpn = asyncHandler(async (req, res) => {
  let vnp_Params = req.query;
  const isValid = vnpay.verifyReturnUrl({ ...vnp_Params });

  if (!isValid) {
    return res.status(200).json({ RspCode: "97", Message: "Fail checksum" });
  }

  const orderId = vnp_Params["vnp_TxnRef"];
  const responseCode = vnp_Params["vnp_ResponseCode"];
  const vnp_TransactionNo = vnp_Params["vnp_TransactionNo"];

  const payment = await Payment.findOneAndUpdate(
    { order_id: String(orderId), status: "pending" },
    {
      $set: {
        status: responseCode === "00" ? "success" : "failed",
        vnp_transaction_no: vnp_TransactionNo,
        vnp_response_code: responseCode,
        updated_at: new Date()
      }
    },
    { new: true }
  );

  if (!payment) {
    const existing = await Payment.findOne({ order_id: String(orderId) });
    if (existing && existing.status !== "pending") {
      return res.status(200).json({ RspCode: "02", Message: "Order already confirmed" });
    }
    return res.status(200).json({ RspCode: "01", Message: "Order not found" });
  }

  if (responseCode === "00") {
    // Add coins to user
    const coinsToAdd = Math.floor(payment.amount / 1000) * 100;
    await User.findByIdAndUpdate(payment.user_id, {
      $inc: { coins: coinsToAdd },
    });

    res.status(200).json({ RspCode: "00", Message: "Success" });
  } else {
    res.status(200).json({ RspCode: "00", Message: "Success" });
  }
});

export { 
  createPayment,
  vnpayReturn,
  vnpayIpn,
 };
