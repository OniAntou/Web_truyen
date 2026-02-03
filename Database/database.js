const mongoose = require('mongoose');

// Kết nối tới MongoDB localhost theo thông số bạn cung cấp
const dbURI = 'mongodb://localhost:27017/skycomic';

mongoose.connect(dbURI)
  .then(() => console.log('✅ Connected to MongoDB: skycomic'))
  .catch((err) => console.error('❌ Connection error:', err));

// --- SCHEMAS ---

// 1. Comic Collection
const ComicSchema = new mongoose.Schema({
  id: Number, // Legacy ID from mockData for easy migration
  title: { type: String, required: true },
  author: String,
  artist: String,
  status: String,
  cover_url: String, // Cloudflare URL
  description: String,
  rating: { type: Number, default: 0 },
  views: { type: String, default: "0" },
  genres: [String],
  created_at: { type: Date, default: Date.now }
}, { collection: 'comic' }); // Chỉ định rõ tên collection

const Comic = mongoose.model('Comic', ComicSchema);

// 2. Chapter Collection
const ChapterSchema = new mongoose.Schema({
  comic_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Comic' },
  chapter_number: Number,
  title: String,
  date: String, // For display strings like "2 days ago"
  created_at: { type: Date, default: Date.now }
}, { collection: 'chapter' });

const Chapter = mongoose.model('Chapter', ChapterSchema);

// 3. Pages Collection (Sửa tên theo ý bạn)
const PageSchema = new mongoose.Schema({
  chapter_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' },
  page_number: { type: Number, required: true },
  image_url: { type: String, required: true } // Cloudflare URL
}, { collection: 'pages' }); // Ép buộc tên collection là 'pages'

const Pages = mongoose.model('Pages', PageSchema);

module.exports = { Comic, Chapter, Pages };