const { Payment, User } = require("../../Database/database");
const vnpay = require("../utils/vnpay");
const asyncHandler = require("../middleware/asyncHandler");
const AppError = require("../utils/AppError");

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

  const payment = await Payment.findOne({ order_id: orderId });
  if (!payment) {
    return res.status(200).json({ success: false, message: "Order not found" });
  }

  if (responseCode === "00") {
    if (payment.status !== "success") {
      // Update payment status
      payment.status = "success";
      payment.vnp_transaction_no = vnp_TransactionNo;
      payment.vnp_response_code = responseCode;
      payment.updated_at = Date.now();
      await payment.save();

      // Update user coins (Conversion: 1,000 VND = 100 Coins)
      const coinsToAdd = Math.floor(payment.amount / 1000) * 100;
      await User.findByIdAndUpdate(payment.user_id, {
        $inc: { coins: coinsToAdd },
      });
    }
    return res.json({ success: true, message: "Thanh toán thành công" });
  } else {
    payment.status = "failed";
    payment.vnp_response_code = responseCode;
    payment.updated_at = Date.now();
    await payment.save();
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

  const payment = await Payment.findOne({ order_id: orderId });
  if (!payment) {
    return res.status(200).json({ RspCode: "01", Message: "Order not found" });
  }

  // Check if IPN already processed
  if (payment.status !== "pending") {
    return res.status(200).json({ RspCode: "02", Message: "Order already confirmed" });
  }

  if (responseCode === "00") {
    // Success
    payment.status = "success";
    payment.vnp_transaction_no = vnp_TransactionNo;
    payment.vnp_response_code = responseCode;
    payment.updated_at = Date.now();
    await payment.save();

    // Add coins to user
    const coinsToAdd = Math.floor(payment.amount / 1000) * 100;
    await User.findByIdAndUpdate(payment.user_id, {
      $inc: { coins: coinsToAdd },
    });

    res.status(200).json({ RspCode: "00", Message: "Success" });
  } else {
    // Failed
    payment.status = "failed";
    payment.vnp_response_code = responseCode;
    payment.updated_at = Date.now();
    await payment.save();
    res.status(200).json({ RspCode: "00", Message: "Success" });
  }
});

module.exports = {
  createPayment,
  vnpayReturn,
  vnpayIpn,
};
