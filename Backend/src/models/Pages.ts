import mongoose from "mongoose";

const PageSchema = new mongoose.Schema(
  {
    chapter_id: { type: mongoose.Schema.Types.ObjectId, ref: "Chapter" },
    page_number: { type: Number, required: true },
    image_url: { type: String, required: true },
  },
  {
    collection: "pages",
    autoIndex: process.env.NODE_ENV !== "production",
  },
);
PageSchema.index({ chapter_id: 1, page_number: 1 }, { unique: true });

export const Pages = mongoose.model("Pages", PageSchema);
