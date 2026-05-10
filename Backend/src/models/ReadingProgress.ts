import mongoose from "mongoose";

const ReadingProgressSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    comic_id: { type: mongoose.Schema.Types.ObjectId, ref: "Comic", required: true },
    chapter_id: { type: mongoose.Schema.Types.ObjectId, ref: "Chapter", required: true },
    page_number: { type: Number, default: 1 },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  { collection: "reading_progress" },
);

ReadingProgressSchema.index({ user_id: 1, comic_id: 1 }, { unique: true });

export const ReadingProgress = mongoose.model("ReadingProgress", ReadingProgressSchema);
