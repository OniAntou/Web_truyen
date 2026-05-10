import mongoose from "mongoose";

const GenreSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    created_at: { type: Date, default: Date.now },
  },
  { collection: "genres" },
);

export const Genre = mongoose.model("Genre", GenreSchema);
