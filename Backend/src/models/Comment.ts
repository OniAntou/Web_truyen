import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    comic_id: { type: mongoose.Schema.Types.ObjectId, ref: "Comic", required: true },
    chapter_id: { type: mongoose.Schema.Types.ObjectId, ref: "Chapter", required: false },
    parent_id: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null },
    content: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
  },
  { collection: "comments" },
);

CommentSchema.index({ comic_id: 1 });
CommentSchema.index({ chapter_id: 1 });
CommentSchema.index({ parent_id: 1 });
CommentSchema.index({ created_at: -1 });

export const Comment = mongoose.model("Comment", CommentSchema);
