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
    views: { type: Number, default: 0 },
    genres: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Genre' }],
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

module.exports = { Comic, Chapter, Pages, Upload, AdminLogin, Genre };