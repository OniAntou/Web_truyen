const mongoose = require("mongoose");

const uriFromEnv = process.env.MONGO_URI;
if (!uriFromEnv) {
  console.error("WARNING: MONGO_URI was not found in the environment. Falling back to localhost.");
}

const dbURI = uriFromEnv || "mongodb://localhost:27017/skycomic";
const globalMongoose = global.__webTruyenMongoose || (global.__webTruyenMongoose = {
  promise: null,
  loggedUri: null,
});

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

    globalMongoose.promise = mongoose.connect(dbURI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
      minPoolSize: 1,
      retryWrites: true,
    });

  try {
    await globalMongoose.promise;
    const isAtlas = /\.mongodb\.net($|[:\/])/.test(dbURI);
    if (globalMongoose.loggedUri !== dbURI) {
      console.log(`Connected to MongoDB: ${isAtlas ? "MongoDB Atlas" : "Localhost"}`);
      if (isAtlas) {
        console.log(`MongoDB host: ${dbURI.split("@")[1] || "Hidden"}`);
      }
      globalMongoose.loggedUri = dbURI;
    }
    return mongoose.connection;
  } catch (err) {
    globalMongoose.promise = null;
    console.error("MongoDB connection error:", err);
    throw err;
  }
}

mongoose.connection.on("disconnected", () => {
  globalMongoose.promise = null;
});

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

// Compound indexes for common sorting/filtering
ComicSchema.index({ views: -1, created_at: -1 });
ComicSchema.index({ weekly_views: -1, created_at: -1 });
ComicSchema.index({ rating: -1, created_at: -1 });

const Comic = mongoose.model("Comic", ComicSchema);

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

const Chapter = mongoose.model("Chapter", ChapterSchema);

const PageSchema = new mongoose.Schema(
  {
    chapter_id: { type: mongoose.Schema.Types.ObjectId, ref: "Chapter" },
    page_number: { type: Number, required: true },
    image_url: { type: String, required: true },
  },
  { collection: "pages" },
);
PageSchema.index({ chapter_id: 1, page_number: 1 });

const Pages = mongoose.model("Pages", PageSchema);

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

const Upload = mongoose.model("Upload", UploadSchema);

const AdminLoginSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { collection: "adminlogin" },
);

const AdminLogin = mongoose.model("AdminLogin", AdminLoginSchema);

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "creator", "admin"], default: "user" },
    coins: { type: Number, default: 0 },
    is_vip: { type: Boolean, default: false },
    vip_expiry: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    created_at: { type: Date, default: Date.now },
  },
  { collection: "users" },
);

UserSchema.index({ role: 1 });

const User = mongoose.model("User", UserSchema);

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

const Rating = mongoose.model("Rating", RatingSchema);

const ComicViewSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    comic_id: { type: mongoose.Schema.Types.ObjectId, ref: "Comic", required: true },
    created_at: { type: Date, default: Date.now },
  },
  { collection: "comic_views" },
);

ComicViewSchema.index({ user_id: 1, comic_id: 1 }, { unique: true });

const ComicView = mongoose.model("ComicView", ComicViewSchema);

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

const Comment = mongoose.model("Comment", CommentSchema);

const FavoriteSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    comic_id: { type: mongoose.Schema.Types.ObjectId, ref: "Comic", required: true },
    created_at: { type: Date, default: Date.now },
  },
  { collection: "favorites" },
);

FavoriteSchema.index({ user_id: 1, comic_id: 1 }, { unique: true });

const Favorite = mongoose.model("Favorite", FavoriteSchema);

const GenreSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    created_at: { type: Date, default: Date.now },
  },
  { collection: "genres" },
);

const Genre = mongoose.model("Genre", GenreSchema);

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

const Application = mongoose.model("Application", ApplicationSchema);

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

const ReadingProgress = mongoose.model("ReadingProgress", ReadingProgressSchema);

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

const Payment = mongoose.model("Payment", PaymentSchema);

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

const ChapterUnlock = mongoose.model("ChapterUnlock", ChapterUnlockSchema);

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

const Report = mongoose.model("Report", ReportSchema);

module.exports = {
  Comic,
  Chapter,
  Pages,
  Upload,
  AdminLogin,
  Genre,
  User,
  Rating,
  ComicView,
  Comment,
  Favorite,
  Application,
  ReadingProgress,
  Payment,
  ChapterUnlock,
  Report,
  connectDB,
  mongoose,
};
