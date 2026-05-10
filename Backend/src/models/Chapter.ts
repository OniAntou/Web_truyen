import mongoose from "mongoose";

const ChapterSchema = new mongoose.Schema(
  {
    comic_id: { type: mongoose.Schema.Types.ObjectId, ref: "Comic" },
    chapter_number: Number,
    title: String,
    date: String,
    price: { type: Number, default: 0 },
    early_access_end_date: { type: Date },
    created_at: { type: Date, default: Date.now },
  },
  { collection: "chapter" },
);

ChapterSchema.index({ comic_id: 1, chapter_number: 1 });
ChapterSchema.index({ created_at: -1 });

export const Chapter = mongoose.model("Chapter", ChapterSchema);
