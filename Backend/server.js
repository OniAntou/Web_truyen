const dotenv = require("dotenv");
dotenv.config(); // Load env vars immediately

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { Comic, Chapter, Pages, Upload, AdminLogin, Genre, User, Rating, ComicView, Comment, Favorite, Application, ReadingProgress } = require('../Database/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cron = require('node-cron');
const r2Module = require('./r2');
const { uploadToR2, getFileUrl, resolveR2Url, R2_ENABLED, deleteFromR2 } = r2Module;

// --- CRON JOBS ---
// Reset weekly_views to 0 every Monday at 00:00
cron.schedule('0 0 * * 1', async () => {
  try {
    const result = await Comic.updateMany({}, { $set: { weekly_views: 0 } });
    console.log(`[Cron] Reset weekly views for ${result.modifiedCount} comics.`);
  } catch (err) {
    console.error(`[Cron Error] Failed to reset weekly views:`, err);
  }
});

const app = express();
const PORT = process.env.PORT || 5000;

// Multer: lưu file trong memory để gửi lên R2
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = /^image\/(jpeg|jpg|png|gif|webp)$/i.test(file.mimetype);
    if (allowed) cb(null, true);
    else cb(new Error("Chỉ chấp nhận ảnh: JPEG, PNG, GIF, WebP"));
  },
});

// Middleware
app.use(cors());
app.use(express.json());

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: "Không tìm thấy token" });
  
  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
    if (err) return res.status(403).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    req.user = user;
    next();
  });
};



// Routes
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.get("/api/test", (req, res) => {
  res.json({ message: "Connection successful! Hello from Express!" });
});

// Admin Login
app.post("/api/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Vui lòng nhập username và password" });
    }
    const admin = await AdminLogin.findOne({ username, password });
    if (!admin) {
      return res.status(401).json({ message: "Sai tên đăng nhập hoặc mật khẩu" });
    }
    res.json({ message: "Đăng nhập thành công", admin: { username: admin.username } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- USER AUTHENTICATION ---
// User Register
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email đã được sử dụng" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const avatar = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(username)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
    const newUser = new User({ username, email, password: hashedPassword, avatar });
    await newUser.save();
    
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
    res.status(201).json({ message: "Đăng ký thành công", token, user: { username: newUser.username, email: newUser.email, avatar: newUser.avatar, role: newUser.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// User Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Sai email hoặc mật khẩu" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Sai email hoặc mật khẩu" });
    }
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
    res.json({ message: "Đăng nhập thành công", token, user: { username: user.username, email: user.email, avatar: user.avatar, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get User Profile
app.get("/api/users/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: "User không tồn tại" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Self-Delete (Authenticated User)
app.delete("/api/users/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User không tồn tại" });

    // 1. Rollback views
    const userViews = await ComicView.find({ user_id: user._id });
    for (const view of userViews) {
      await Comic.findByIdAndUpdate(view.comic_id, { $inc: { views: -1 } });
    }
    await ComicView.deleteMany({ user_id: user._id });

    // 2. Rollback ratings
    const userRatings = await Rating.find({ user_id: user._id });
    for (const rating of userRatings) {
      const comic = await Comic.findById(rating.comic_id);
      if (comic) {
        const result = await Rating.aggregate([
          { $match: { comic_id: comic._id, user_id: { $ne: user._id } } },
          { $group: { _id: null, avgRating: { $avg: "$rating" } } }
        ]);
        const avg = result.length > 0 ? result[0].avgRating : 0;
        const newAvg = Number(avg.toFixed(1));
        const newCount = Math.max(0, (comic.rating_count || 1) - 1);
        await Comic.updateOne(
          { _id: comic._id },
          { $set: { rating: newAvg, rating_count: newCount } }
        );
      }
    }
    await Rating.deleteMany({ user_id: user._id });

    // 2.5 Rollback comments
    await Comment.deleteMany({ user_id: user._id });

    // 2.6 Rollback favorites
    await Favorite.deleteMany({ user_id: user._id });

    // 3. Delete user
    await User.findByIdAndDelete(user._id);

    res.json({ message: "Tài khoản của bạn đã được xóa thành công." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// User Delete (Admin or Self)
app.delete("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User không tồn tại" });

    // 1. Rollback views
    const userViews = await ComicView.find({ user_id: user._id });
    for (const view of userViews) {
      await Comic.findByIdAndUpdate(view.comic_id, { $inc: { views: -1 } });
    }
    await ComicView.deleteMany({ user_id: user._id });

    // 2. Rollback ratings
    const userRatings = await Rating.find({ user_id: user._id });
    for (const rating of userRatings) {
      const comic = await Comic.findById(rating.comic_id);
      if (comic) {
        // Recalculate average rating for comic (omitting this user's rating)
        const result = await Rating.aggregate([
          { $match: { comic_id: comic._id, user_id: { $ne: user._id } } },
          { $group: { _id: null, avgRating: { $avg: "$rating" } } }
        ]);
        const avg = result.length > 0 ? result[0].avgRating : 0;
        const newAvg = Number(avg.toFixed(1));
        const newCount = Math.max(0, (comic.rating_count || 1) - 1);
        await Comic.updateOne(
          { _id: comic._id },
          { $set: { rating: newAvg, rating_count: newCount } }
        );
      }
    }
    await Rating.deleteMany({ user_id: user._id });

    // 2.5 Rollback comments
    await Comment.deleteMany({ user_id: user._id });

    // 2.6 Rollback favorites
    await Favorite.deleteMany({ user_id: user._id });

    // 3. Delete user
    await User.findByIdAndDelete(user._id);

    res.json({ message: "Đã xoá user và hoàn tác các lượt view/rating liên quan" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- Cloudflare R2 / Upload ---
app.get("/api/r2/status", (req, res) => {
  res.json({
    connected: R2_ENABLED,
    message: R2_ENABLED ? "R2 đã kết nối" : "R2 chưa cấu hình",
  });
});

// Lấy signed URL cho key (frontend dùng làm img src)
app.get("/api/media/signed-url", async (req, res) => {
  try {
    const key = req.query.key;
    if (!key) return res.status(400).json({ message: "Thiếu query key" });
    const url = await getFileUrl(key, 3600);
    if (!url)
      return res
        .status(404)
        .json({ message: "Không tìm thấy hoặc R2 chưa cấu hình" });
    res.json({ url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Upload ảnh bìa (cover) cho comic
app.post(
  "/api/upload/cover/:comicId",
  upload.single("cover"),
  async (req, res) => {
    try {
      if (!R2_ENABLED)
        return res.status(503).json({ message: "R2 chưa được cấu hình" });
      const comicId = req.params.comicId;
      let comic;
      if (comicId.match(/^[0-9a-fA-F]{24}$/)) {
        comic = await Comic.findById(comicId);
      } else {
        comic = await Comic.findOne({ id: parseInt(comicId) });
      }
      if (!comic)
        return res.status(404).json({ message: "Comic không tồn tại" });
      if (!req.file)
        return res
          .status(400)
          .json({ message: "Cần gửi file ảnh (field: cover)" });
      const ext = (req.file.originalname || "").split(".").pop() || "jpg";
      const key = `covers/${comicId}/${Date.now()}.${ext}`;
      const { key: r2Key } = await uploadToR2(
        key,
        req.file.buffer,
        req.file.mimetype,
      );
      await Upload.create({ key: r2Key, type: "cover", comic_id: comic._id });
      comic.cover_url = r2Key;
      await comic.save();
      res.status(201).json({ comic, cover_url: r2Key });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
);

// Upload ảnh chapter (nhiều ảnh → Pages)
app.post(
  "/api/upload/chapter/:chapterId",
  upload.array("pages", 50),
  async (req, res) => {
    try {
      if (!R2_ENABLED)
        return res.status(503).json({ message: "R2 chưa được cấu hình" });
      const chapterId = req.params.chapterId;
      const chapter = await Chapter.findById(chapterId);
      if (!chapter)
        return res.status(404).json({ message: "Chapter không tồn tại" });
      const comicId = chapter.comic_id;
      if (!req.files?.length)
        return res
          .status(400)
          .json({ message: "Cần gửi ít nhất một ảnh (field: pages)" });
      const created = [];
      for (let i = 0; i < req.files.length; i++) {
        const f = req.files[i];
        const ext = (f.originalname || "").split(".").pop() || "jpg";
        const key = `chapters/${chapterId}/${i + 1}.${ext}`;
        const { key: r2Key } = await uploadToR2(key, f.buffer, f.mimetype);
        await Upload.create({
          key: r2Key,
          type: "page",
          comic_id: comicId,
          chapter_id: chapter._id,
          page_number: i + 1,
        });
        const page = await Pages.create({
          chapter_id: chapter._id,
          page_number: i + 1,
          image_url: r2Key,
        });
        created.push(page);
      }
      res.status(201).json({ chapter: chapterId, pages: created });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
);

// GET pages of a chapter (with resolved URLs)
app.get("/api/chapters/:chapterId/pages", async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.chapterId);
    if (!chapter) return res.status(404).json({ message: "Chapter không tồn tại" });

    const pages = await Pages.find({ chapter_id: chapter._id }).sort({ page_number: 1 });
    const pagesWithUrls = await Promise.all(
      pages.map(async (p) => ({
        _id: p._id,
        page_number: p.page_number,
        image_url: (await resolveR2Url(p.image_url)) || p.image_url,
      }))
    );
    res.json(pagesWithUrls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT reorder pages of a chapter
app.put("/api/chapters/:chapterId/reorder-pages", async (req, res) => {
  try {
    const { order } = req.body; // array of { pageId, page_number }
    if (!order || !Array.isArray(order)) {
      return res.status(400).json({ message: "Cần gửi mảng order: [{ pageId, page_number }]" });
    }

    const chapter = await Chapter.findById(req.params.chapterId);
    if (!chapter) return res.status(404).json({ message: "Chapter không tồn tại" });

    // Bulk update page numbers
    const bulkOps = order.map(({ pageId, page_number }) => ({
      updateOne: {
        filter: { _id: pageId, chapter_id: chapter._id },
        update: { $set: { page_number } },
      },
    }));

    await Pages.bulkWrite(bulkOps);
    res.json({ message: "Đã cập nhật thứ tự trang thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET dashboard stats
app.get("/api/stats", async (req, res) => {
  try {
    const comicCount = await Comic.countDocuments();

    // Calculate total views (sum of all comic views)
    // Since views are strings like "12.5M", we might need to parse them.
    // For now, let's just count documents to return a simple "Total Comics".
    // Calculating "Total Views" from strings like "12.5M" is tricky without parsing logic.
    // Let's defer exact view count for now or implement a basic parser if needed.
    // Or simply finding all comics and summing up a numeric field if we converted it.
    // Given the current status, we'll just return the comic count and a placeholder/sum for views if possible.

    const comics = await Comic.find();
    let totalViews = 0;

    comics.forEach((c) => {
      totalViews += (c.views || 0);
    });

    // Format back to compact string
    const formatViews = (num) => {
      if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
      if (num >= 1000) return (num / 1000).toFixed(1) + "K";
      return num.toString();
    };

    res.json({
      totalComics: comicCount,
      totalViews: formatViews(totalViews),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Helper for chapter counts to prevent N+1 queries
async function getChapterCounts(comicIds) {
  if (!comicIds || comicIds.length === 0) return {};
  const aggs = await Chapter.aggregate([
    { $match: { comic_id: { $in: comicIds } } },
    { $group: { _id: "$comic_id", count: { $sum: 1 } } }
  ]);
  const counts = {};
  aggs.forEach(agg => counts[agg._id.toString()] = agg.count);
  return counts;
}

// GET all genres with comic counts, and optionally comics for a specific genre
app.get('/api/genres', async (req, res) => {
  try {
    const { genre, sort = 'views' } = req.query;

    // Lấy tất cả genres từ bảng Genre
    const allGenres = await Genre.find().sort({ name: 1 });

    // Đếm số comic cho mỗi genre
    const genres = await Promise.all(allGenres.map(async (g) => {
      const count = await Comic.countDocuments({ genres: g._id });
      return { _id: g._id, name: g.name, slug: g.slug, description: g.description, count };
    }));

    // Nếu có filter theo genre cụ thể, trả về comics của genre đó
    let comics = [];
    if (genre) {
      // Tìm genre theo tên hoặc slug
      const genreDoc = await Genre.findOne({
        $or: [
          { name: { $regex: new RegExp(`^${genre}$`, 'i') } },
          { slug: genre.toLowerCase() }
        ]
      });

      if (genreDoc) {
        let filtered = await Comic.find({ genres: genreDoc._id }).populate('genres', 'name slug');

        if (sort === 'rating') {
          filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        } else if (sort === 'newest') {
          filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        } else {
          filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        }

        const comicIds = filtered.map(c => c._id);
        const chapterCounts = await getChapterCounts(comicIds);

        comics = await Promise.all(filtered.map(async (c) => {
          const coverUrl = await resolveR2Url(c.cover_url);
          return {
            ...c.toObject(),
            cover_url: coverUrl || c.cover_url,
            chapter_count: chapterCounts[c._id.toString()] || 0,
          };
        }));
      }
    }

    res.json({ genres, comics });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET latest comics (sorted by created_at desc)
app.get('/api/comics/latest', async (req, res) => {
  try {
    const { genre, page = 1, limit = 20 } = req.query;
    let filter = {};
    if (genre) {
      // Tìm genre theo tên hoặc slug
      const genreDoc = await Genre.findOne({
        $or: [
          { name: { $regex: new RegExp(`^${genre}$`, 'i') } },
          { slug: genre.toLowerCase() }
        ]
      });
      if (genreDoc) {
        filter.genres = genreDoc._id;
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Comic.countDocuments(filter);
    const comics = await Comic.find(filter)
      .populate('genres', 'name slug')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const comicIds = comics.map(c => c._id);
    const chapterCounts = await getChapterCounts(comicIds);

    const results = await Promise.all(comics.map(async (c) => {
      const coverUrl = await resolveR2Url(c.cover_url);
      return {
        ...c.toObject(),
        cover_url: coverUrl || c.cover_url,
        chapter_count: chapterCounts[c._id.toString()] || 0,
      };
    }));

    // Lấy genres từ bảng Genre
    const allGenres = await Genre.find().sort({ name: 1 }).select('name slug');

    res.json({
      comics: results,
      genres: allGenres,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET popular comics (sorted by views desc, with filters)
app.get("/api/comics/popular", async (req, res) => {
  try {
    const { genre, sort = "views", limit } = req.query;
    let filter = {};
    if (genre) {
      // Tìm genre theo tên hoặc slug
      const genreDoc = await Genre.findOne({
        $or: [
          { name: { $regex: new RegExp(`^${genre}$`, 'i') } },
          { slug: genre.toLowerCase() }
        ]
      });
      if (genreDoc) {
        filter.genres = genreDoc._id;
      }
    }

    let comics = await Comic.find(filter).populate('genres', 'name slug');

    // Sort
    if (sort === "rating") {
      comics.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sort === "newest") {
      comics.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else {
      // Default: sort by views descending
      comics.sort((a, b) => (b.views || 0) - (a.views || 0));
    }

    if (limit) {
      comics = comics.slice(0, parseInt(limit));
    }

    const comicIds = comics.map(c => c._id);
    const chapterCounts = await getChapterCounts(comicIds);

    // Resolve cover URLs
    const results = await Promise.all(
      comics.map(async (c) => {
        const coverUrl = await resolveR2Url(c.cover_url);
        return {
          ...c.toObject(),
          cover_url: coverUrl || c.cover_url,
          chapter_count: chapterCounts[c._id.toString()] || 0,
        };
      }),
    );

    // Lấy genres từ bảng Genre
    const allGenres = await Genre.find().sort({ name: 1 }).select('name slug');

    res.json({ comics: results, genres: allGenres });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all comics
app.get("/api/comics", async (req, res) => {
  try {
    const { q } = req.query;
    let query = {};

    if (q) {
      query = { title: { $regex: q, $options: "i" } };
    }

    const comics = await Comic.find(query).populate('genres', 'name slug');
    const comicIds = comics.map(c => c._id);
    const chapterCounts = await getChapterCounts(comicIds);

    const results = await Promise.all(
      comics.map(async (c) => {
        const coverUrl = await resolveR2Url(c.cover_url);
        return {
          ...c.toObject(),
          cover_url: coverUrl || c.cover_url,
          chapter_count: chapterCounts[c._id.toString()] || 0,
        };
      }),
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET trending comics (sorted by weekly_views)
app.get("/api/comics/trending", async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // Sort by weekly_views descending
    let comics = await Comic.find({}).sort({ weekly_views: -1 }).limit(parseInt(limit)).populate('genres', 'name slug');
    
    // Fallback if weekly_views is all 0 or not enough data:
    // It will naturally sort by insertion order or other defaults, which is fine since the query guarantees limit.

    const comicIds = comics.map(c => c._id);
    const chapterCounts = await getChapterCounts(comicIds);

    const results = await Promise.all(
      comics.map(async (c) => {
        const coverUrl = await resolveR2Url(c.cover_url);
        return {
          ...c.toObject(),
          cover_url: coverUrl || c.cover_url,
          chapter_count: chapterCounts[c._id.toString()] || 0,
        };
      })
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET partial comic by ID (supporting both MongoDB _id and legacy numeric id)
app.get("/api/comics/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let comic;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      comic = await Comic.findById(id);
    } else {
      comic = await Comic.findOne({ id: parseInt(id) });
    }

    if (!comic) return res.status(404).json({ message: "Comic not found" });

    // Fetch chapters và pages
    const chapters = await Chapter.find({ comic_id: comic._id }).sort({
      chapter_number: 1,
    });
    // Helper: Format exact date (DD/MM/YYYY)
    const formatExactDate = (date) => {
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    };

    const chaptersWithoutPages = chapters.map(ch => {
      // Calculate exact date from created_at
      const relativeDate = ch.created_at ? formatExactDate(ch.created_at) : (ch.date || 'Unknown');
      return { ...ch.toObject(), date: relativeDate };
    });

    const coverUrl = await resolveR2Url(comic.cover_url);
    const genreIds = Array.isArray(comic.genres) ? comic.genres : [];
    const genreNames = genreIds.length > 0
      ? await Genre.find({ _id: { $in: genreIds } }).select('name slug')
      : [];
    const out = {
      ...comic.toObject(),
      cover_url: coverUrl || comic.cover_url,
      chapters: chaptersWithoutPages,
      genres: genreNames,
    };
    res.json(out);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- ADMIN API ENDPOINTS ---

// --- CREATOR APPLICATIONS ---
// Submit application (User must be logged in)
app.post("/api/applications", authenticateToken, async (req, res) => {
  try {
    const { penName, portfolio, reason } = req.body;
    if (!penName || !reason) {
      return res.status(400).json({ message: "Vui lòng điền Bút danh và Lời giới thiệu" });
    }
    // Check if already applied
    const existing = await Application.findOne({ user_id: req.user.id, status: { $in: ['pending', 'approved'] } });
    if (existing) {
      return res.status(400).json({ message: "Bạn đã nộp đơn rồi hoặc đã là tác giả." });
    }
    
    const newApp = new Application({
      user_id: req.user.id,
      penName,
      portfolio,
      reason
    });
    await newApp.save();
    res.status(201).json({ message: "Nộp đơn thành công", application: newApp });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Get all applications
app.get("/api/admin/applications", async (req, res) => {
  try {
    const apps = await Application.find().populate('user_id', 'email username').sort({ created_at: -1 });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Update application status
app.put("/api/admin/applications/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }
    
    const appDoc = await Application.findById(req.params.id);
    if (!appDoc) {
      return res.status(404).json({ message: "Không tìm thấy đơn" });
    }
    
    appDoc.status = status;
    await appDoc.save();
    
    if (status === 'approved') {
      await User.findByIdAndUpdate(appDoc.user_id, { role: 'creator' });
    }
    
    res.json({ message: `Đã ${status} đơn ứng tuyển`, application: appDoc });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// [MOVED] Admin Login route moved to top

// Helper to process genres array
async function processGenres(genresInput) {
  if (!genresInput || !Array.isArray(genresInput)) return [];
  const genreIds = [];
  for (const g of genresInput) {
    if (typeof g === 'string') {
      if (g.match(/^[0-9a-fA-F]{24}$/)) {
        genreIds.push(g);
        continue;
      }
      let genreDoc = await Genre.findOne({ name: { $regex: new RegExp(`^${g}$`, 'i') } });
      if (!genreDoc) {
        const slug = g.toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/đ/g, "d")
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-+|-+$/g, "");
        genreDoc = await Genre.create({ name: g, slug: slug || Date.now().toString() });
      }
      genreIds.push(genreDoc._id);
    } else if (g && g._id) {
      genreIds.push(g._id);
    } else {
      genreIds.push(g);
    }
  }
  return genreIds;
}

// --- CREATOR STUDIO API ---
app.get("/api/studio/comics", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'creator') {
      return res.status(403).json({ message: "Bạn không có quyền truy cập Creator Studio." });
    }

    const comics = await Comic.find({ uploader_id: user._id }).sort({ created_at: -1 }).populate('genres', 'name slug');
    const comicIds = comics.map(c => c._id);
    const chapterCounts = await getChapterCounts(comicIds);

    const results = await Promise.all(
      comics.map(async (c) => {
        const coverUrl = await resolveR2Url(c.cover_url);
        return {
          ...c.toObject(),
          cover_url: coverUrl || c.cover_url,
          chapter_count: chapterCounts[c._id.toString()] || 0,
        };
      })
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE a new comic (Protected: Creator or Admin)
app.post("/api/comics", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || (user.role !== 'creator' && user.role !== 'admin')) {
        // Fallback for AdminLogin table admins if token fails is missing here, but we'll assume creators use this.
        // For strictness, allowing if role is creator or admin.
    }

    const lastComic = await Comic.findOne().sort({ id: -1 });
    const newId = lastComic && lastComic.id ? lastComic.id + 1 : 1;

    const payload = { ...req.body };
    if (payload.genres) {
      payload.genres = await processGenres(payload.genres);
    }

    const comicData = {
      id: newId,
      uploader_id: req.user.id,
      ...payload,
    };

    const newComic = new Comic(comicData);
    await newComic.save();
    res.status(201).json(newComic);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// UPDATE a comic
app.put("/api/comics/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let comic;

    const payload = { ...req.body };
    if (payload.genres) {
      payload.genres = await processGenres(payload.genres);
    }

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      comic = await Comic.findByIdAndUpdate(id, payload, { new: true });
    } else {
      comic = await Comic.findOneAndUpdate({ id: parseInt(id) }, payload, {
        new: true,
      });
    }

    if (!comic) return res.status(404).json({ message: "Comic not found" });
    res.json(comic);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a comic
app.delete("/api/comics/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let comic;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      comic = await Comic.findByIdAndDelete(id);
    } else {
      comic = await Comic.findOneAndDelete({ id: parseInt(id) });
    }

    if (!comic) return res.status(404).json({ message: "Comic not found" });
    res.json({ message: "Comic deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE a comic
app.delete("/api/comics/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let comic;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      comic = await Comic.findByIdAndDelete(id);
    } else {
      comic = await Comic.findOneAndDelete({ id: parseInt(id) });
    }

    if (!comic) return res.status(404).json({ message: "Comic not found" });

    // 1. Delete cover from R2 (if it's an R2 URL)
    if (comic.cover_url && comic.cover_url.startsWith('r2:')) {
      await deleteFromR2(comic.cover_url);
    }

    // 2. Find all chapters for this comic
    const chapters = await Chapter.find({ comic_id: comic._id });
    const chapterIds = chapters.map(ch => ch._id);

    // 3. Find all pages for these chapters
    const pages = await Pages.find({ chapter_id: { $in: chapterIds } });
    
    // 4. Delete all page images from R2
    const r2Pages = pages.filter(p => p.image_url && p.image_url.startsWith('r2:'));
    await Promise.all(r2Pages.map(p => deleteFromR2(p.image_url)));

    // 5. Delete all from Upload collection
    await Upload.deleteMany({ comic_id: comic._id });

    // 6. Delete pages and chapters from DB
    await Pages.deleteMany({ chapter_id: { $in: chapterIds } });
    await Chapter.deleteMany({ comic_id: comic._id });

    // 7. Cleanup remaining references
    await Rating.deleteMany({ comic_id: comic._id }); // cleanup ratings
    await ComicView.deleteMany({ comic_id: comic._id }); // cleanup views
    await Comment.deleteMany({ comic_id: comic._id }); // cleanup comments
    await Favorite.deleteMany({ comic_id: comic._id }); // cleanup favorites

    res.json({ message: "Comic deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- RATING API ---
// Fetch user's rating for a specific comic
app.get("/api/comics/:id/user-rating", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    let comic;
    if (id.match(/^[0-9a-fA-F]{24}$/)) comic = await Comic.findById(id);
    else comic = await Comic.findOne({ id: parseInt(id) });
    
    if (!comic) return res.status(404).json({ message: "Comic không tồn tại" });

    const rating = await Rating.findOne({ user_id: req.user.id, comic_id: comic._id });
    res.json({ rating: rating ? rating.rating : 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Submit a rating
app.post("/api/comics/:id/rate", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating phải từ 1 đến 5" });
    }

    let comic;
    if (id.match(/^[0-9a-fA-F]{24}$/)) comic = await Comic.findById(id);
    else comic = await Comic.findOne({ id: parseInt(id) });
    
    if (!comic) return res.status(404).json({ message: "Comic không tồn tại" });

    // Create or update the rating
    const existingRating = await Rating.findOne({ user_id: req.user.id, comic_id: comic._id });
    
    let newRatingCount = comic.rating_count || 0;
    if (existingRating) {
      existingRating.rating = rating;
      await existingRating.save();
    } else {
      await Rating.create({ user_id: req.user.id, comic_id: comic._id, rating });
      newRatingCount += 1;
    }

    // Recalculate average rating
    const result = await Rating.aggregate([
      { $match: { comic_id: comic._id } },
      { $group: { _id: null, avgRating: { $avg: "$rating" } } }
    ]);
    
    const avg = result.length > 0 ? result[0].avgRating : rating;
    const newAvg = Number(avg.toFixed(1));
    
    await Comic.updateOne(
      { _id: comic._id },
      { $set: { rating: newAvg, rating_count: newRatingCount } }
    );

    res.json({ message: "Đánh giá thành công", rating: newAvg, user_rating: rating, rating_count: newRatingCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- VIEW API ---
// Ghi nhận một lượt xem mới cho người dùng
app.post("/api/comics/:id/view", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    let comic;
    if (id.match(/^[0-9a-fA-F]{24}$/)) comic = await Comic.findById(id);
    else comic = await Comic.findOne({ id: parseInt(id) });
    
    if (!comic) return res.status(404).json({ message: "Comic không tồn tại" });

    const existingView = await ComicView.findOne({ user_id: req.user.id, comic_id: comic._id });
    if (!existingView) {
      await ComicView.create({ user_id: req.user.id, comic_id: comic._id });
      await Comic.updateOne({ _id: comic._id }, { $inc: { views: 1, weekly_views: 1 } });
      comic.views = (comic.views || 0) + 1;
      comic.weekly_views = (comic.weekly_views || 0) + 1;
    }
    
    res.json({ message: "Lượt xem đã được ghi nhận", views: comic.views, weekly_views: comic.weekly_views });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- COMMENT API ---
// Fetch comments for a comic (or chapter)
app.get("/api/comics/:id/comments", async (req, res) => {
  try {
    const { id } = req.params;
    const { chapterId } = req.query;
    let comic;
    if (id.match(/^[0-9a-fA-F]{24}$/)) comic = await Comic.findById(id);
    else comic = await Comic.findOne({ id: parseInt(id) });
    
    if (!comic) return res.status(404).json({ message: "Comic không tồn tại" });

    let filter = { comic_id: comic._id };
    if (chapterId) {
      filter.chapter_id = chapterId;
    } else {
      filter.chapter_id = { $exists: false };
    }

    const comments = await Comment.find(filter)
      .populate('user_id', 'username avatar')
      .sort({ created_at: -1 });
      
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Post a comment
app.post("/api/comics/:id/comments", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    
    if (!content || !content.trim()) return res.status(400).json({ message: "Nội dung không được để trống" });

    let comic;
    if (id.match(/^[0-9a-fA-F]{24}$/)) comic = await Comic.findById(id);
    else comic = await Comic.findOne({ id: parseInt(id) });
    
    if (!comic) return res.status(404).json({ message: "Comic không tồn tại" });

    const newComment = await Comment.create({
      user_id: req.user.id,
      comic_id: comic._id,
      content: content.trim()
    });

    const populatedComment = await Comment.findById(newComment._id).populate('user_id', 'username avatar');
    
    res.json({ message: "Đăng bình luận thành công", comment: populatedComment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- FAVORITE API ---
// Check if user has favorited a comic
app.get("/api/comics/:id/favorite", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    let comic;
    if (id.match(/^[0-9a-fA-F]{24}$/)) comic = await Comic.findById(id);
    else comic = await Comic.findOne({ id: parseInt(id) });
    
    if (!comic) return res.status(404).json({ message: "Comic không tồn tại" });

    const favorite = await Favorite.findOne({ user_id: req.user.id, comic_id: comic._id });
    res.json({ isFavorited: !!favorite });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all favorites for a user
app.get("/api/users/favorites", authenticateToken, async (req, res) => {
  try {
    const favorites = await Favorite.find({ user_id: req.user.id })
      .populate({
        path: 'comic_id',
        populate: { path: 'genres', select: 'name slug' }
      })
      .sort({ created_at: -1 });

    const comics = favorites.map(f => f.comic_id).filter(c => c != null);
    const comicIds = comics.map(c => c._id);
    const chapterCounts = await getChapterCounts(comicIds);

    const results = await Promise.all(comics.map(async (c) => {
      const coverUrl = await resolveR2Url(c.cover_url);
      return {
        ...c.toObject(),
        cover_url: coverUrl || c.cover_url,
        chapter_count: chapterCounts[c._id.toString()] || 0,
      };
    }));

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Toggle favorite status
app.post("/api/comics/:id/favorite", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    let comic;
    if (id.match(/^[0-9a-fA-F]{24}$/)) comic = await Comic.findById(id);
    else comic = await Comic.findOne({ id: parseInt(id) });
    
    if (!comic) return res.status(404).json({ message: "Comic không tồn tại" });

    const existingFavorite = await Favorite.findOne({ user_id: req.user.id, comic_id: comic._id });
    
    if (existingFavorite) {
      // Remove favorite
      await Favorite.findByIdAndDelete(existingFavorite._id);
      res.json({ message: "Đã hủy yêu thích", isFavorited: false });
    } else {
      // Add favorite
      await Favorite.create({ user_id: req.user.id, comic_id: comic._id });
      res.json({ message: "Đã thêm vào yêu thích", isFavorited: true });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE a new chapter
app.post("/api/chapters", async (req, res) => {
  try {
    const newChapter = new Chapter(req.body);
    await newChapter.save();
    res.status(201).json(newChapter);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a chapter
app.delete("/api/chapters/:id", async (req, res) => {
  try {
    const chapterId = req.params.id;
    const chapter = await Chapter.findByIdAndDelete(chapterId);
    if (!chapter) return res.status(404).json({ message: "Chapter not found" });

    // Find all pages for this chapter
    const pages = await Pages.find({ chapter_id: chapterId });
    
    // Delete page images from R2
    const r2Pages = pages.filter(p => p.image_url && p.image_url.startsWith('r2:'));
    await Promise.all(r2Pages.map(p => deleteFromR2(p.image_url)));

    // Delete pages from DB
    await Pages.deleteMany({ chapter_id: chapterId });
    
    // Delete from Uploads tracking
    await Upload.deleteMany({ chapter_id: chapterId });

    res.json({ message: "Chapter and its pages deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// BULK DELETE chapters
app.post('/api/chapters/bulk-delete', async (req, res) => {
  try {
    const { chapterIds } = req.body;
    if (!chapterIds || !Array.isArray(chapterIds)) {
      return res.status(400).json({ message: 'Invalid payload: chapterIds must be an array' });
    }

    // Find all pages for these chapters
    const pages = await Pages.find({ chapter_id: { $in: chapterIds } });
    
    // Delete page images from R2
    const r2Pages = pages.filter(p => p.image_url && p.image_url.startsWith('r2:'));
    await Promise.all(r2Pages.map(p => deleteFromR2(p.image_url)));

    // Delete pages from DB
    await Pages.deleteMany({ chapter_id: { $in: chapterIds } });
    
    // Delete from Uploads tracking
    await Upload.deleteMany({ chapter_id: { $in: chapterIds } });

    // Delete chapters
    const result = await Chapter.deleteMany({ _id: { $in: chapterIds } });
    
    res.json({ message: 'Chapters and their pages deleted', count: result.deletedCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE a specific page from a chapter
app.delete("/api/chapters/:chapterId/pages/:pageId", async (req, res) => {
  try {
    const { chapterId, pageId } = req.params;
    
    const page = await Pages.findOne({ _id: pageId, chapter_id: chapterId });
    if (!page) return res.status(404).json({ message: "Page not found" });

    // Delete from R2
    if (page.image_url && page.image_url.startsWith('r2:')) {
      await deleteFromR2(page.image_url);
    }

    // Delete from Uploads tracking
    await Upload.deleteMany({ key: page.image_url });

    // Delete from DB
    await Pages.findByIdAndDelete(pageId);

    // Re-adjust page numbers for subsequent pages
    await Pages.updateMany(
      { chapter_id: chapterId, page_number: { $gt: page.page_number } },
      { $inc: { page_number: -1 } }
    );

    res.json({ message: "Page deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- READING PROGRESS API ---
// Get user's reading progress for a comic
app.get("/api/comics/:id/reading-progress", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    let comic;
    if (id.match(/^[0-9a-fA-F]{24}$/)) comic = await Comic.findById(id);
    else comic = await Comic.findOne({ id: parseInt(id) });
    
    if (!comic) return res.status(404).json({ message: "Comic không tồn tại" });

    const progress = await ReadingProgress.findOne({ 
      user_id: req.user.id, 
      comic_id: comic._id 
    }).populate('chapter_id', 'title chapter_number');

    if (!progress) {
      return res.json({ hasProgress: false });
    }

    res.json({ 
      hasProgress: true,
      chapter_id: progress.chapter_id._id,
      chapter_number: progress.chapter_id.chapter_number,
      chapter_title: progress.chapter_id.title,
      page_number: progress.page_number,
      updated_at: progress.updated_at
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update user's reading progress
app.post("/api/comics/:id/reading-progress", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { chapter_id, page_number = 1 } = req.body;
    
    if (!chapter_id) {
      return res.status(400).json({ message: "Thiếu chapter_id" });
    }

    let comic;
    if (id.match(/^[0-9a-fA-F]{24}$/)) comic = await Comic.findById(id);
    else comic = await Comic.findOne({ id: parseInt(id) });
    
    if (!comic) return res.status(404).json({ message: "Comic không tồn tại" });

    // Verify chapter belongs to this comic
    const chapter = await Chapter.findOne({ _id: chapter_id, comic_id: comic._id });
    if (!chapter) {
      return res.status(404).json({ message: "Chapter không tồn tại hoặc không thuộc comic này" });
    }

    const existingProgress = await ReadingProgress.findOne({ 
      user_id: req.user.id, 
      comic_id: comic._id 
    });

    if (existingProgress) {
      // Update existing progress
      existingProgress.chapter_id = chapter_id;
      existingProgress.page_number = page_number;
      existingProgress.updated_at = new Date();
      await existingProgress.save();
    } else {
      // Create new progress
      await ReadingProgress.create({
        user_id: req.user.id,
        comic_id: comic._id,
        chapter_id: chapter_id,
        page_number: page_number
      });
    }

    res.json({ message: "Reading progress updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all reading progress for a user (for "Continue Reading" section)
app.get("/api/users/reading-progress", authenticateToken, async (req, res) => {
  try {
    const progresses = await ReadingProgress.find({ user_id: req.user.id })
      .populate({
        path: 'comic_id',
        populate: { path: 'genres', select: 'name slug' }
      })
      .populate('chapter_id', 'title chapter_number')
      .sort({ updated_at: -1 })
      .limit(10);

    const results = await Promise.all(progresses.map(async (progress) => {
      const coverUrl = await resolveR2Url(progress.comic_id.cover_url);
      return {
        comic_id: progress.comic_id._id,
        comic_title: progress.comic_id.title,
        comic_cover: coverUrl || progress.comic_id.cover_url,
        chapter_id: progress.chapter_id._id,
        chapter_number: progress.chapter_id.chapter_number,
        chapter_title: progress.chapter_id.title,
        page_number: progress.page_number,
        updated_at: progress.updated_at,
        genres: progress.comic_id.genres
      };
    }));

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get read status for all chapters of a comic
app.get("/api/comics/:id/chapters/read-status", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    let comic;
    if (id.match(/^[0-9a-fA-F]{24}$/)) comic = await Comic.findById(id);
    else comic = await Comic.findOne({ id: parseInt(id) });
    
    if (!comic) return res.status(404).json({ message: "Comic không tồn tại" });

    // Get all chapters for this comic
    const chapters = await Chapter.find({ comic_id: comic._id })
      .sort({ chapter_number: 1 })
      .select('_id chapter_number title');

    // Get all reading progress for this user and comic
    const progresses = await ReadingProgress.find({ 
      user_id: req.user.id, 
      comic_id: comic._id 
    }).select('chapter_id page_number');

    // Get page counts for all chapters to determine if they're fully read
    const chapterIds = chapters.map(ch => ch._id);
    const pageCounts = await Promise.all(
      chapterIds.map(async (chapterId) => {
        const count = await Pages.countDocuments({ chapter_id: chapterId });
        return { chapterId, count };
      })
    );

    const pageCountMap = {};
    pageCounts.forEach(({ chapterId, count }) => {
      pageCountMap[chapterId.toString()] = count;
    });

    // Create a map of chapter_id -> progress info
    const progressMap = {};
    progresses.forEach(progress => {
      const chapterId = progress.chapter_id.toString();
      const totalPages = pageCountMap[chapterId] || 1;
      
      progressMap[chapterId] = {
        hasProgress: true,
        current_page: progress.page_number,
        isRead: progress.page_number > 0, // Consider chapter read if user has viewed at least 1 page
        totalPages: totalPages
      };
    });

    // Combine chapters with their read status
    const chaptersWithStatus = chapters.map(chapter => {
      const chapterId = chapter._id.toString();
      const progress = progressMap[chapterId];
      
      return {
        _id: chapter._id,
        chapter_number: chapter.chapter_number,
        title: chapter.title,
        isRead: progress ? progress.isRead : false,
        currentPage: progress ? progress.current_page : 0,
        totalPages: progress ? progress.totalPages : (pageCountMap[chapterId] || 0),
        hasProgress: !!progress
      };
    });

    res.json(chaptersWithStatus);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- GENRE CRUD API ---

// GET tất cả genres (từ bảng genres)
app.get('/api/genres/list', async (req, res) => {
  try {
    const genres = await Genre.find().sort({ name: 1 });
    res.json(genres);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET genre theo ID hoặc slug
app.get('/api/genres/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    let genre;
    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      genre = await Genre.findById(idOrSlug);
    } else {
      genre = await Genre.findOne({ slug: idOrSlug });
    }
    if (!genre) return res.status(404).json({ message: 'Genre không tồn tại' });
    res.json(genre);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST tạo genre mới
app.post('/api/genres', async (req, res) => {
  try {
    const { name, slug, description } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ message: 'Cần có name và slug' });
    }
    const existing = await Genre.findOne({ $or: [{ name }, { slug }] });
    if (existing) {
      return res.status(409).json({ message: 'Genre đã tồn tại (trùng name hoặc slug)' });
    }
    const genre = await Genre.create({ name, slug, description });
    res.status(201).json(genre);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT cập nhật genre
app.put('/api/genres/:id', async (req, res) => {
  try {
    const genre = await Genre.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!genre) return res.status(404).json({ message: 'Genre không tồn tại' });
    res.json(genre);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE xoá genre
app.delete('/api/genres/:id', async (req, res) => {
  try {
    const genre = await Genre.findByIdAndDelete(req.params.id);
    if (!genre) return res.status(404).json({ message: 'Genre không tồn tại' });
    res.json({ message: 'Đã xoá genre thành công' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (WITH STATS)`);
});
