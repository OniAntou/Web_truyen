import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    description: { type: String },
    order_id: { type: String, required: true, unique: true },
    vnp_transaction_no: { type: String },
    status: { type: String, enum: ["pending", "success", "failed"], default: "pending" },
    vnp_response_code: { type: String },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  { collection: "payments" },
);

export const Payment = mongoose.model("Payment", PaymentSchema);
