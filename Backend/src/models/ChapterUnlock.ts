import mongoose from "mongoose";

const ChapterUnlockSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    chapter_id: { type: mongoose.Schema.Types.ObjectId, ref: "Chapter", required: true },
    price: { type: Number, required: true },
    created_at: { type: Date, default: Date.now },
  },
  { collection: "chapter_unlocks" },
);

ChapterUnlockSchema.index({ user_id: 1, chapter_id: 1 }, { unique: true });

export const ChapterUnlock = mongoose.model("ChapterUnlock", ChapterUnlockSchema);
