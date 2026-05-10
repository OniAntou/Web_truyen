import mongoose from "mongoose";

const UploadSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    type: { type: String, enum: ["cover", "page"], required: true },
    comic_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comic",
      required: true,
    },
    chapter_id: { type: mongoose.Schema.Types.ObjectId, ref: "Chapter" },
    page_number: { type: Number },
    created_at: { type: Date, default: Date.now },
  },
  { collection: "uploads" },
);

export const Upload = mongoose.model("Upload", UploadSchema);
