import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "creator", "admin"], default: "user" },
    coins: { type: Number, default: 0 },
    is_vip: { type: Boolean, default: false },
    vip_expiry: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    avatar_url: { type: String, default: "" },
    created_at: { type: Date, default: Date.now },
  },
  { collection: "users" },
);

UserSchema.index({ role: 1 });

export const User = mongoose.model("User", UserSchema);
