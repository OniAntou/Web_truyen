import mongoose from "mongoose";

const RatingSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    comic_id: { type: mongoose.Schema.Types.ObjectId, ref: "Comic", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    created_at: { type: Date, default: Date.now },
  },
  { collection: "ratings" },
);
RatingSchema.index({ comic_id: 1 });
RatingSchema.index({ user_id: 1, comic_id: 1 }, { unique: true });

export const Rating = mongoose.model("Rating", RatingSchema);
