import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    penName: { type: String, required: true },
    portfolio: { type: String, default: "" },
    reason: { type: String, required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    created_at: { type: Date, default: Date.now },
  },
  { collection: "applications" },
);

export const Application = mongoose.model("Application", ApplicationSchema);
