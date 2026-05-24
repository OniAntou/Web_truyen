import mongoose, { Schema, Document } from "mongoose";

export interface IAuditLog extends Document {
  user_id: mongoose.Types.ObjectId;
  action: string;
  target_type: string;
  target_id?: mongoose.Types.ObjectId;
  details?: any;
  ip_address?: string;
  created_at: Date;
}

const AuditLogSchema: Schema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  action: { type: String, required: true },
  target_type: { type: String, required: true },
  target_id: { type: Schema.Types.ObjectId },
  details: { type: Schema.Types.Mixed },
  ip_address: { type: String },
  created_at: { type: Date, default: Date.now }
});

// Index to optimize searching by action or user
AuditLogSchema.index({ user_id: 1, created_at: -1 });
AuditLogSchema.index({ action: 1, created_at: -1 });
AuditLogSchema.index({ target_type: 1, target_id: 1 });

export const AuditLog = mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
