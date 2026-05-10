import mongoose from "mongoose";

const ComicViewSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    comic_id: { type: mongoose.Schema.Types.ObjectId, ref: "Comic", required: true },
    created_at: { type: Date, default: Date.now },
  },
  { collection: "comic_views" },
);

ComicViewSchema.index({ user_id: 1, comic_id: 1 }, { unique: true });

export const ComicView = mongoose.model("ComicView", ComicViewSchema);
