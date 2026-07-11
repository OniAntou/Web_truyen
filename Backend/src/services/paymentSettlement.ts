import crypto from "crypto";
import { Payment, User, mongoose } from "../database";

export type PaymentSettlementResult = "settled" | "already-settled" | "not-found";

export const createPaymentOrderId = () => `PAY_${crypto.randomUUID().replaceAll("-", "")}`;

export const coinsForPayment = (amount: number) => Math.floor(amount / 1000) * 100;

export async function settlePayment(
  orderId: string,
  responseCode: string,
  transactionNo?: string,
): Promise<PaymentSettlementResult> {
  const session = await mongoose.startSession();

  try {
    let result: PaymentSettlementResult = "not-found";

    await session.withTransaction(async () => {
      const payment = await Payment.findOne({ order_id: orderId, status: "pending" }).session(session);

      if (!payment) {
        result = await Payment.exists({ order_id: orderId }).session(session)
          ? "already-settled"
          : "not-found";
        return;
      }

      const successful = responseCode === "00";
      payment.status = successful ? "success" : "failed";
      payment.vnp_transaction_no = transactionNo;
      payment.vnp_response_code = responseCode;
      payment.updated_at = new Date();
      await payment.save({ session });

      if (successful) {
        const update = await User.updateOne(
          { _id: payment.user_id },
          { $inc: { coins: coinsForPayment(payment.amount) } },
          { session },
        );

        if (update.matchedCount !== 1) {
          throw new Error("Payment user no longer exists");
        }
      }

      result = "settled";
    });

    return result;
  } finally {
    await session.endSession();
  }
}
