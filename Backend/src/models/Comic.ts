import mongoose from "mongoose";

const ComicSchema = new mongoose.Schema(
  {
    id: Number,
    title: { type: String, required: true },
    author: String,
    artist: String,
    status: String,
    cover_url: String,
    description: String,
    rating: { type: Number, default: 0 },
    rating_count: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    weekly_views: { type: Number, default: 0 },
    genres: [{ type: mongoose.Schema.Types.ObjectId, ref: "Genre" }],
    uploader_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    chapter_count: { type: Number, default: 0 },
    latest_chapter: {
      id: mongoose.Schema.Types.ObjectId,
      chapter_number: Number,
      title: String,
      created_at: Date,
    },
    created_at: { type: Date, default: Date.now },
  },
  { collection: "comic" },
);

ComicSchema.index({ title: "text" });
ComicSchema.index({ views: -1 });
ComicSchema.index({ weekly_views: -1 });
ComicSchema.index({ created_at: -1 });
ComicSchema.index({ genres: 1 });
ComicSchema.index({ uploader_id: 1 });
ComicSchema.index({ views: -1, created_at: -1 });
ComicSchema.index({ weekly_views: -1, created_at: -1 });
ComicSchema.index({ rating: -1, created_at: -1 });

export const Comic = mongoose.model("Comic", ComicSchema);
