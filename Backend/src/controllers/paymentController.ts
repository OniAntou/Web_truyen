import { Payment } from "../database";
import * as vnpay from "../utils/vnpay";
import asyncHandler from "../middleware/asyncHandler";
import AppError from "../utils/AppError";
import { createPaymentOrderId, settlePayment } from "../services/paymentSettlement";

/**
 * Handle VNPay Payments
 */
const createPayment = asyncHandler(async (req, res) => {
  const { amount, bankCode, locale } = req.body;
  const userId = req.user.id;

  if (!amount || amount < 5000) {
    throw new AppError("Số tiền tối thiểu là 5,000 VNĐ", 400);
  }

  const orderId = createPaymentOrderId();
  const orderInfo = `Nap Linh thach cho user ${userId}`;

  console.log(`[Payment] Creating payment for user ${userId}, amount ${amount}`);

  const paymentUrl = vnpay.createPaymentUrl({
    amount,
    orderId,
    orderInfo,
    bankCode,
    locale,
    ipAddr: req.ip || "127.0.0.1",
  });

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
  const vnpParams = req.query;
  const isValid = vnpay.verifyReturnUrl({ ...vnpParams });

  if (!isValid) {
    return res.status(200).json({ success: false, message: "Checksum failed" });
  }

  const orderId = String(vnpParams["vnp_TxnRef"]);
  const responseCode = String(vnpParams["vnp_ResponseCode"]);
  const transactionNo = String(vnpParams["vnp_TransactionNo"] || "");
  const settlement = await settlePayment(orderId, responseCode, transactionNo);

  if (settlement === "already-settled") {
    return res.json({ success: true, message: "Giao dịch đã được xử lý trước đó" });
  }
  if (settlement === "not-found") {
    return res.status(200).json({ success: false, message: "Order not found or already processed" });
  }

  if (responseCode === "00") {
    return res.json({ success: true, message: "Thanh toán thành công" });
  }

  return res.json({ success: false, message: "Thanh toán thất bại", code: responseCode });
});

/**
 * Handle VNPay IPN (background notification)
 */
const vnpayIpn = asyncHandler(async (req, res) => {
  const vnpParams = req.query;
  const isValid = vnpay.verifyReturnUrl({ ...vnpParams });

  if (!isValid) {
    return res.status(200).json({ RspCode: "97", Message: "Fail checksum" });
  }

  const orderId = String(vnpParams["vnp_TxnRef"]);
  const responseCode = String(vnpParams["vnp_ResponseCode"]);
  const transactionNo = String(vnpParams["vnp_TransactionNo"] || "");
  const settlement = await settlePayment(orderId, responseCode, transactionNo);

  if (settlement === "already-settled") {
    return res.status(200).json({ RspCode: "02", Message: "Order already confirmed" });
  }
  if (settlement === "not-found") {
    return res.status(200).json({ RspCode: "01", Message: "Order not found" });
  }

  return res.status(200).json({ RspCode: "00", Message: "Success" });
});

export {
  createPayment,
  vnpayReturn,
  vnpayIpn,
};
