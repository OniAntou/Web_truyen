const mongoose = require("mongoose");

// Kết nối tới MongoDB localhost theo thông số bạn cung cấp
const dbURI = "mongodb://localhost:27017/skycomic";

mongoose
  .connect(dbURI)
  .then(() => console.log("✅ Connected to MongoDB: skycomic"))
  .catch((err) => console.error("❌ Connection error:", err));

// --- SCHEMAS ---

// 1. Comic Collection
const ComicSchema = new mongoose.Schema(
  {
    id: Number, // Legacy ID from mockData for easy migration
    title: { type: String, required: true },
    author: String,
    artist: String,
    status: String,
    cover_url: String, // Cloudflare URL
    description: String,
    rating: { type: Number, default: 0 },
    rating_count: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    weekly_views: { type: Number, default: 0 },
    genres: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Genre' }],
    uploader_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    created_at: { type: Date, default: Date.now },
  },
  { collection: "comic" },
); // Chỉ định rõ tên collection

const Comic = mongoose.model("Comic", ComicSchema);

// 2. Chapter Collection
const ChapterSchema = new mongoose.Schema(
  {
    comic_id: { type: mongoose.Schema.Types.ObjectId, ref: "Comic" },
    chapter_number: Number,
    title: String,
    date: String, // For display strings like "2 days ago"
    created_at: { type: Date, default: Date.now },
  },
  { collection: "chapter" },
);

const Chapter = mongoose.model("Chapter", ChapterSchema);

// 3. Pages Collection (Sửa tên theo ý bạn)
const PageSchema = new mongoose.Schema(
  {
    chapter_id: { type: mongoose.Schema.Types.ObjectId, ref: "Chapter" },
    page_number: { type: Number, required: true },
    image_url: { type: String, required: true }, // Cloudflare URL
  },
  { collection: "pages" },
); // Ép buộc tên collection là 'pages'

const Pages = mongoose.model("Pages", PageSchema);

// 4. Upload Collection – liên kết file R2 với Comic/Chapter (ảnh bìa + ảnh chapter)
const UploadSchema = new mongoose.Schema(
  {
    key: { type: String, required: true }, // R2 key (vd: "r2:covers/xxx.jpg")
    type: { type: String, enum: ["cover", "page"], required: true },
    comic_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comic",
      required: true,
    },
    chapter_id: { type: mongoose.Schema.Types.ObjectId, ref: "Chapter" }, // null cho ảnh bìa
    page_number: { type: Number }, // cho type 'page'
    created_at: { type: Date, default: Date.now },
  },
  { collection: "uploads" },
);

const Upload = mongoose.model("Upload", UploadSchema);

// 5. AdminLogin Collection
const AdminLoginSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { collection: "adminlogin" },
);

const AdminLogin = mongoose.model("AdminLogin", AdminLoginSchema);

// 5.1. User Collection
const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String, default: "" },
    role: { type: String, enum: ['user', 'creator', 'admin'], default: 'user' },
    created_at: { type: Date, default: Date.now },
  },
  { collection: "users" },
);

const User = mongoose.model("User", UserSchema);

// 5.2. Rating Collection
const RatingSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    comic_id: { type: mongoose.Schema.Types.ObjectId, ref: "Comic", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    created_at: { type: Date, default: Date.now },
  },
  { collection: "ratings" },
);

const Rating = mongoose.model("Rating", RatingSchema);

// 5.3. ComicView Collection
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

// 5.4. Comment Collection
const CommentSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    comic_id: { type: mongoose.Schema.Types.ObjectId, ref: "Comic", required: true },
    chapter_id: { type: mongoose.Schema.Types.ObjectId, ref: "Chapter", required: false },
    content: { type: String, required: true },
    created_at: { type: Date, default: Date.now }
  },
  { collection: "comments" },
);

const Comment = mongoose.model("Comment", CommentSchema);

// 5.5. Favorite Collection
const FavoriteSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    comic_id: { type: mongoose.Schema.Types.ObjectId, ref: "Comic", required: true },
    created_at: { type: Date, default: Date.now }
  },
  { collection: "favorites" },
);

FavoriteSchema.index({ user_id: 1, comic_id: 1 }, { unique: true });

const Favorite = mongoose.model("Favorite", FavoriteSchema);

// 6. Genre Collection – Lưu thể loại truyện
const GenreSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // Tên thể loại (vd: "Hành Động")
    slug: { type: String, required: true, unique: true }, // URL-friendly (vd: "hanh-dong")
    description: { type: String, default: "" },            // Mô tả thể loại
    created_at: { type: Date, default: Date.now },
  },
  { collection: "genres" },
);

const Genre = mongoose.model("Genre", GenreSchema);

// 7. Application Collection - Creator application requests
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

module.exports = { Comic, Chapter, Pages, Upload, AdminLogin, Genre, User, Rating, ComicView, Comment, Favorite, Application };