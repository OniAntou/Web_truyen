const fs = require('fs');
const path = require('path');

const modelsDir = 'c:/Users/USER/Downloads/Web_truyen/Backend/src/models';

const models = {
  Upload: `import mongoose from "mongoose";

const UploadSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    type: { type: String, enum: ["cover", "page"], required: true },
    comic_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comic",
      required: true,
    },
    chapter_id: { type: mongoose.Schema.Types.ObjectId, ref: "Chapter" },
    page_number: { type: Number },
    created_at: { type: Date, default: Date.now },
  },
  { collection: "uploads" },
);

export const Upload = mongoose.model("Upload", UploadSchema);`,
  AdminLogin: `import mongoose from "mongoose";

const AdminLoginSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { collection: "adminlogin" },
);

export const AdminLogin = mongoose.model("AdminLogin", AdminLoginSchema);`,
  Rating: `import mongoose from "mongoose";

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

export const Rating = mongoose.model("Rating", RatingSchema);`,
  ComicView: `import mongoose from "mongoose";

const ComicViewSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    comic_id: { type: mongoose.Schema.Types.ObjectId, ref: "Comic", required: true },
    created_at: { type: Date, default: Date.now },
  },
  { collection: "comic_views" },
);

ComicViewSchema.index({ user_id: 1, comic_id: 1 }, { unique: true });

export const ComicView = mongoose.model("ComicView", ComicViewSchema);`,
  Comment: `import mongoose from "mongoose";

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

export const Comment = mongoose.model("Comment", CommentSchema);`,
  Favorite: `import mongoose from "mongoose";

const FavoriteSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    comic_id: { type: mongoose.Schema.Types.ObjectId, ref: "Comic", required: true },
    created_at: { type: Date, default: Date.now },
  },
  { collection: "favorites" },
);

FavoriteSchema.index({ user_id: 1, comic_id: 1 }, { unique: true });

export const Favorite = mongoose.model("Favorite", FavoriteSchema);`,
  Application: `import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    penName: { type: String, required: true },
    portfolio: { type: String, default: "" },
    reason: { type: String, required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    created_at: { type: Date, default: Date.now },
  },
  { collection: "applications" },
);

export const Application = mongoose.model("Application", ApplicationSchema);`,
  ReadingProgress: `import mongoose from "mongoose";

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

export const ReadingProgress = mongoose.model("ReadingProgress", ReadingProgressSchema);`,
  Payment: `import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    description: { type: String },
    order_id: { type: String, required: true, unique: true },
    vnp_transaction_no: { type: String },
    status: { type: String, enum: ["pending", "success", "failed"], default: "pending" },
    vnp_response_code: { type: String },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  { collection: "payments" },
);

export const Payment = mongoose.model("Payment", PaymentSchema);`,
  ChapterUnlock: `import mongoose from "mongoose";

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

export const ChapterUnlock = mongoose.model("ChapterUnlock", ChapterUnlockSchema);`,
  Report: `import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    target_type: { type: String, enum: ["chapter", "comment"], required: true },
    target_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    reason: { type: String, required: true },
    detail: { type: String, default: "" }, // Optional detail if "Other" is selected
    status: { type: String, enum: ["pending", "resolved", "dismissed"], default: "pending" },
    created_at: { type: Date, default: Date.now },
  },
  { collection: "reports" }
);

ReportSchema.index({ status: 1 });
ReportSchema.index({ target_type: 1 });
ReportSchema.index({ created_at: -1 });

export const Report = mongoose.model("Report", ReportSchema);`
};

for (const [name, content] of Object.entries(models)) {
  fs.writeFileSync(path.join(modelsDir, `${name}.ts`), content);
  console.log(`Created ${name}.ts`);
}
