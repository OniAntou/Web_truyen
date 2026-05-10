import mongoose from "mongoose";

const AdminLoginSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { collection: "adminlogin" },
);

export const AdminLogin = mongoose.model("AdminLogin", AdminLoginSchema);
