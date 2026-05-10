import mongoose from "mongoose";

const FavoriteSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    comic_id: { type: mongoose.Schema.Types.ObjectId, ref: "Comic", required: true },
    created_at: { type: Date, default: Date.now },
  },
  { collection: "favorites" },
);

FavoriteSchema.index({ user_id: 1, comic_id: 1 }, { unique: true });

export const Favorite = mongoose.model("Favorite", FavoriteSchema);
