import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    target_type: { type: String, enum: ["chapter", "comment"], required: true },
    target_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    reason: { type: String, required: true },
    detail: { type: String, default: "" }, // Optional detail if "Other" is selected
    status: { type: String, enum: ["pending", "resolved", "dismissed"], default: "pending" },
    created_at: { type: Date, default: Date.now },
  },
  { collection: "reports" }
);

ReportSchema.index({ status: 1 });
ReportSchema.index({ target_type: 1 });
ReportSchema.index({ created_at: -1 });

export const Report = mongoose.model("Report", ReportSchema);
