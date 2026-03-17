const dotenv = require("dotenv");
dotenv.config(); // Load env vars immediately

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { Comic, Chapter, Pages, Upload, AdminLogin, Genre } = require('../Database/database');
const r2Module = require('./r2');
const { uploadToR2, getFileUrl, resolveR2Url, R2_ENABLED } = r2Module;

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
        let filtered = await Comic.find({ genres: genreDoc._id });

        if (sort === 'rating') {
          filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        } else if (sort === 'newest') {
          filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        } else {
          filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        }

        comics = await Promise.all(filtered.map(async (c) => {
          const coverUrl = await resolveR2Url(c.cover_url);
          const chapterCount = await Chapter.countDocuments({ comic_id: c._id });
          // Populate genre names
          const genreIds = Array.isArray(c.genres) ? c.genres : [];
          const genreNames = genreIds.length > 0
            ? await Genre.find({ _id: { $in: genreIds } }).select('name slug')
            : [];
          return {
            ...c.toObject(),
            cover_url: coverUrl || c.cover_url,
            chapter_count: chapterCount,
            genres: genreNames,
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
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const results = await Promise.all(comics.map(async (c) => {
      const coverUrl = await resolveR2Url(c.cover_url);
      const chapterCount = await Chapter.countDocuments({ comic_id: c._id });
      const genreIds = Array.isArray(c.genres) ? c.genres : [];
      const genreNames = genreIds.length > 0
        ? await Genre.find({ _id: { $in: genreIds } }).select('name slug')
        : [];
      return {
        ...c.toObject(),
        cover_url: coverUrl || c.cover_url,
        chapter_count: chapterCount,
        genres: genreNames,
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

    let comics = await Comic.find(filter);

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

    // Resolve cover URLs
    const results = await Promise.all(
      comics.map(async (c) => {
        const coverUrl = await resolveR2Url(c.cover_url);
        const chapterCount = await Chapter.countDocuments({ comic_id: c._id });
        const genreIds = Array.isArray(c.genres) ? c.genres : [];
        const genreNames = genreIds.length > 0
          ? await Genre.find({ _id: { $in: genreIds } }).select('name slug')
          : [];
        return {
          ...c.toObject(),
          cover_url: coverUrl || c.cover_url,
          chapter_count: chapterCount,
          genres: genreNames,
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

    const comics = await Comic.find(query);
    const results = await Promise.all(
      comics.map(async (c) => {
        const coverUrl = await resolveR2Url(c.cover_url);
        const chapterCount = await Chapter.countDocuments({ comic_id: c._id });
        const genreIds = Array.isArray(c.genres) ? c.genres : [];
        const genreNames = genreIds.length > 0
          ? await Genre.find({ _id: { $in: genreIds } }).select('name slug')
          : [];
        return {
          ...c.toObject(),
          cover_url: coverUrl || c.cover_url,
          chapter_count: chapterCount,
          genres: genreNames,
        };
      }),
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

    const chaptersWithPages = await Promise.all(
      chapters.map(async (ch) => {
        const pages = await Pages.find({ chapter_id: ch._id }).sort({
          page_number: 1,
        });
        const pagesWithUrls = await Promise.all(
          pages.map(async (p) => ({
            ...p.toObject(),
            image_url: (await resolveR2Url(p.image_url)) || p.image_url,
          })),
        );

        // Calculate exact date from created_at
        const relativeDate = ch.created_at ? formatExactDate(ch.created_at) : (ch.date || 'Unknown');

        return { ...ch.toObject(), pages: pagesWithUrls, date: relativeDate };
      }),
    );

    const coverUrl = await resolveR2Url(comic.cover_url);
    const genreIds = Array.isArray(comic.genres) ? comic.genres : [];
    const genreNames = genreIds.length > 0
      ? await Genre.find({ _id: { $in: genreIds } }).select('name slug')
      : [];
    const out = {
      ...comic.toObject(),
      cover_url: coverUrl || comic.cover_url,
      chapters: chaptersWithPages,
      genres: genreNames,
    };
    res.json(out);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- ADMIN API ENDPOINTS ---

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

// CREATE a new comic
app.post("/api/comics", async (req, res) => {
  try {
    // Simple logic to generate a numeric ID if not provided (for legacy compatibility)
    // In a real app, you might want to rely solely on _id or a dedicated counter
    const lastComic = await Comic.findOne().sort({ id: -1 });
    const newId = lastComic && lastComic.id ? lastComic.id + 1 : 1;

    const payload = { ...req.body };
    if (payload.genres) {
      payload.genres = await processGenres(payload.genres);
    }

    const comicData = {
      id: newId,
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

    // Also delete associated chapters
    await Chapter.deleteMany({ comic_id: comic._id });

    res.json({ message: "Comic deleted successfully" });
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
    const chapter = await Chapter.findByIdAndDelete(req.params.id);
    if (!chapter) return res.status(404).json({ message: "Chapter not found" });
    res.json({ message: "Chapter deleted" });
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

    const result = await Chapter.deleteMany({ _id: { $in: chapterIds } });
    res.json({ message: 'Chapters deleted', count: result.deletedCount });
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
