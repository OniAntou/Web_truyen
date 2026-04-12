const { Comic, Genre } = require('../Database/database');
const { getChapterCounts, processGenres } = require('../utils/helpers');
const { resolveR2Url, deleteFromR2 } = require('../config/r2');
const { Chapter, Pages, Upload, Rating, ComicView, Comment, Favorite } = require('../Database/database');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');
const apiCache = require('../utils/cache');

const getLatestComics = asyncHandler(async (req, res) => {
  const { genre, page = 1, limit = 20 } = req.query;
  
  // Try to get from cache
  const cacheKey = `latest_${genre || 'all'}_${page}_${limit}`;
  const cachedData = apiCache.get(cacheKey);
  if (cachedData) return res.json(cachedData);

  let filter = {};
  if (genre) {
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
    .select('title id author status cover_url rating views weekly_views genres chapter_count created_at')
    .populate('genres', 'name slug')
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  const results = await Promise.all(comics.map(async (c) => {
    const coverUrl = await resolveR2Url(c.cover_url);
    return {
      ...c,
      cover_url: coverUrl || c.cover_url,
    };
  }));

  const allGenres = await Genre.find().sort({ name: 1 }).select('name slug');

  const responseData = {
    comics: results,
    genres: allGenres,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
    }
  };

  // Cache for 5 minutes in memory
  apiCache.set(cacheKey, responseData);

  // Vercel Edge Cache: 5 mins fresh, 10 mins stale-while-revalidate
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
  res.json(responseData);
});

const getPopularComics = asyncHandler(async (req, res) => {
  const { genre, sort = "views", limit } = req.query;

  // Try to get from cache
  const cacheKey = `popular_${genre || 'all'}_${sort}_${limit || 'none'}`;
  const cachedData = apiCache.get(cacheKey);
  if (cachedData) return res.json(cachedData);

  let filter = {};
  if (genre) {
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

  const sortOption = {};
  if (sort === "rating") {
    sortOption.rating = -1;
  } else if (sort === "newest") {
    sortOption.created_at = -1;
  } else {
    sortOption.views = -1;
  }

  let query = Comic.find(filter).populate('genres', 'name slug').sort(sortOption);
  
  if (limit) {
    query = query.limit(parseInt(limit));
  }

  const comics = await query.select('title id author status cover_url rating views weekly_views genres chapter_count created_at').lean();

  const results = await Promise.all(
    comics.map(async (c) => {
      const coverUrl = await resolveR2Url(c.cover_url);
      return {
        ...c,
        cover_url: coverUrl || c.cover_url,
      };
    }),
  );

  const allGenres = await Genre.find().sort({ name: 1 }).select('name slug');
  const responseData = { comics: results, genres: allGenres };
  
  // Cache for 5 minutes in memory
  if (cacheKey) apiCache.set(cacheKey, responseData);

  // Vercel Edge Cache
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
  res.json(responseData);
});

const getAllComics = asyncHandler(async (req, res) => {
  const { q, genre } = req.query;
  let filter = {};

  if (q) {
    // Find matching genres first to include in search
    const matchingGenres = await Genre.find({ 
      name: { $regex: q, $options: "i" } 
    }).select('_id');
    const genreIds = matchingGenres.map(g => g._id);

    filter.$or = [
      { title: { $regex: q, $options: "i" } },
      { genres: { $in: genreIds } }
    ];
  }

  if (genre) {
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

  const comics = await Comic.find(filter)
    .select('title id author status cover_url rating views genres chapter_count created_at')
    .populate('genres', 'name slug')
    .lean();

  const results = await Promise.all(
    comics.map(async (c) => {
      const coverUrl = await resolveR2Url(c.cover_url);
      return {
        ...c,
        cover_url: coverUrl || c.cover_url,
      };
    }),
  );
  res.json({ comics: results });
});

const getTrendingComics = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  // Try to get from cache
  const cacheKey = `trending_${limit}`;
  const cachedData = apiCache.get(cacheKey);
  if (cachedData) return res.json(cachedData);

  let comics = await Comic.find({})
    .sort({ weekly_views: -1 })
    .limit(parseInt(limit))
    .populate('genres', 'name slug')
    .select('title id author status cover_url rating weekly_views genres chapter_count')
    .lean();

  const results = await Promise.all(
    comics.map(async (c) => {
      const coverUrl = await resolveR2Url(c.cover_url);
      return {
        ...c,
        cover_url: coverUrl || c.cover_url,
      };
    })
  );

  const responseData = { comics: results };
  apiCache.set(cacheKey, responseData);

  // Vercel Edge Cache
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
  res.json(responseData);
});

/**
 * Consolidated HomePage API to reduce latency
 */
const getHomeData = asyncHandler(async (req, res) => {
  const cacheKey = 'homepage_all_v2';
  const cachedData = apiCache.get(cacheKey);
  if (cachedData) return res.json(cachedData);

  const [popularResult, latestResult, trendingResult, genres] = await Promise.all([
    Comic.find({}).sort({ views: -1 }).limit(12).populate('genres', 'name slug').select('title id author status cover_url rating views weekly_views genres chapter_count latest_chapter').lean(),
    Comic.find({}).sort({ created_at: -1 }).limit(12).populate('genres', 'name slug').select('title id author status cover_url rating weekly_views genres chapter_count created_at latest_chapter').lean(),
    Comic.find({}).sort({ weekly_views: -1 }).limit(10).populate('genres', 'name slug').select('title id author status cover_url rating weekly_views genres chapter_count latest_chapter').lean(),
    Genre.find().sort({ name: 1 }).select('name slug')
  ]);

  const processList = async (list) => {
    return Promise.all(list.map(async (c) => {
      const coverUrl = await resolveR2Url(c.cover_url);
      return { ...c, cover_url: coverUrl || c.cover_url };
    }));
  };

  const [popular, latest, trending] = await Promise.all([
    processList(popularResult),
    processList(latestResult),
    processList(trendingResult)
  ]);

  const responseData = { popular, latest, trending, genres };
  apiCache.set(cacheKey, responseData, 300); // 5 minutes cache

  // Vercel Edge Cache
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
  res.json(responseData);
});

const getComicById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  let comic;
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    comic = await Comic.findById(id).select('-__v').lean();
  } else {
    comic = await Comic.findOne({ id: parseInt(id) }).select('-__v').lean();
  }

  if (!comic) throw new AppError("Comic not found", 404);

  const chapters = await Chapter.find({ comic_id: comic._id }).sort({ chapter_number: 1 }).lean();
  
  const formatExactDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  let userDoc = null;
  let unlockedChapters = new Set();
  if (req.user) {
    const { User, ChapterUnlock } = require('../Database/database');
    userDoc = await User.findById(req.user.id).select('is_vip vip_expiry role').lean();
    if (!userDoc || !userDoc.is_vip || !userDoc.vip_expiry || new Date(userDoc.vip_expiry) <= new Date()) {
      const unlocks = await ChapterUnlock.find({ user_id: req.user.id }).select('chapter_id').lean();
      unlocks.forEach(u => unlockedChapters.add(u.chapter_id.toString()));
    }
  }

  const chaptersWithoutPages = chapters.map(ch => {
    const relativeDate = ch.created_at ? formatExactDate(ch.created_at) : (ch.date || 'Unknown');
    let is_locked = false;

    if (ch.early_access_end_date && new Date(ch.early_access_end_date) > new Date()) {
      is_locked = true;
      if (req.user && userDoc) { // check userDoc exists
        if (userDoc.role === 'admin' || userDoc.role === 'creator') {
          is_locked = false;
        } else if (userDoc.is_vip && userDoc.vip_expiry && new Date(userDoc.vip_expiry) > new Date()) {
          is_locked = false;
        } else if (unlockedChapters.has(ch._id.toString())) {
          is_locked = false;
        }
      }
    }

    return { ...ch, date: relativeDate, is_locked, price: ch.price || 0 };
  });

  const coverUrl = await resolveR2Url(comic.cover_url);
  const genreIds = Array.isArray(comic.genres) ? comic.genres : [];
  const genreNames = genreIds.length > 0
    ? await Genre.find({ _id: { $in: genreIds } }).select('name slug')
    : [];
  const out = {
    ...comic,
    cover_url: coverUrl || comic.cover_url,
    chapters: chaptersWithoutPages,
    genres: genreNames,
  };
  res.json(out);
});

/**
 * Combined Reader Meta + Pages endpoint to reduce round-trips
 */
const getReaderData = asyncHandler(async (req, res) => {
  const { id, chapterId } = req.params;
  
  let comic;
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    comic = await Comic.findById(id).select('title id cover_url genres').lean();
  } else {
    comic = await Comic.findOne({ id: parseInt(id) }).select('title id cover_url genres').lean();
  }

  if (!comic) throw new AppError("Comic not found", 404);

  const chapters = await Chapter.find({ comic_id: comic._id }).sort({ chapter_number: 1 }).select('chapter_number title created_at price early_access_end_date').lean();
  const chapter = chapters.find(ch => ch._id.toString() === chapterId || (ch.id && ch.id.toString() === chapterId));
  
  if (!chapter) throw new AppError("Chapter not found", 404);

  // Check locking logic
  let is_locked = false;
  let userDoc = null;
  if (chapter.early_access_end_date && new Date(chapter.early_access_end_date) > new Date()) {
    is_locked = true;
    if (req.user) {
      const { User, ChapterUnlock } = require('../Database/database');
      userDoc = await User.findById(req.user.id).lean();
      if (req.user.role === 'admin' || req.user.role === 'creator') {
        is_locked = false;
      } else if (userDoc && userDoc.is_vip && userDoc.vip_expiry && new Date(userDoc.vip_expiry) > new Date()) {
        is_locked = false;
      } else {
        const unlock = await ChapterUnlock.findOne({ user_id: req.user.id, chapter_id: chapter._id }).lean();
        if (unlock) is_locked = false;
      }
    }
  }

  if (is_locked) {
    return res.status(403).json({
      message: "Chapter is locked",
      is_locked: true,
      price: chapter.price || 0,
      early_access_end_date: chapter.early_access_end_date,
      comic: { title: comic.title, id: comic.id }
    });
  }

  const pages = await Pages.find({ chapter_id: chapter._id }).sort({ page_number: 1 }).lean();
  const pageResults = await Promise.all(pages.map(async p => ({
    ...p,
    image_url: await resolveR2Url(p.image_url)
  })));

  const coverUrl = await resolveR2Url(comic.cover_url);
  
  res.json({
    comic: { ...comic, cover_url: coverUrl },
    chapter: { ...chapter, pages: pageResults },
    all_chapters: chapters.map(ch => ({ _id: ch._id, title: ch.title, chapter_number: ch.chapter_number }))
  });
});

const createComic = asyncHandler(async (req, res) => {
  if (!req.user || (req.user.role !== 'creator' && req.user.role !== 'admin')) {
    throw new AppError("Bạn không có quyền đăng truyện.", 403);
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

  // Selective cache flush
  apiCache.flush('latest');
  apiCache.flush('trending');
  apiCache.flush('popular');
  apiCache.flush('homepage');

  res.status(201).json(newComic);
});

const updateComic = asyncHandler(async (req, res) => {
  if (!req.user || (req.user.role !== 'creator' && req.user.role !== 'admin')) {
    throw new AppError("Bạn không có quyền chỉnh sửa truyện.", 403);
  }
  const { id } = req.params;
  let comic;
  const payload = { ...req.body };
  delete payload._id;
  delete payload.id;
  delete payload.__v;
  delete payload.created_at;
  delete payload.updated_at;
  if (payload.genres) {
    payload.genres = await processGenres(payload.genres);
  }

  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    comic = await Comic.findByIdAndUpdate(id, payload, { new: true });
  } else {
    comic = await Comic.findOneAndUpdate({ id: parseInt(id) }, payload, { new: true });
  }

  if (!comic) throw new AppError("Comic not found", 404);
  
  // Selective cache flush
  apiCache.flush('latest');
  apiCache.flush('popular');
  apiCache.flush('trending');
  apiCache.flush('homepage');
  apiCache.flush(`detail_${id}`);
  
  res.json(comic);
});

const deleteComic = asyncHandler(async (req, res) => {
  if (!req.user || (req.user.role !== 'creator' && req.user.role !== 'admin')) {
    throw new AppError("Bạn không có quyền xóa truyện.", 403);
  }
  const { id } = req.params;
  let comic;

  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    comic = await Comic.findByIdAndDelete(id);
  } else {
    comic = await Comic.findOneAndDelete({ id: parseInt(id) });
  }

  if (!comic) throw new AppError("Comic not found", 404);

  if (comic.cover_url && comic.cover_url.startsWith('r2:')) {
    await deleteFromR2(comic.cover_url);
  }

  const chapters = await Chapter.find({ comic_id: comic._id });
  const chapterIds = chapters.map(ch => ch._id);
  const pages = await Pages.find({ chapter_id: { $in: chapterIds } });
  const r2Pages = pages.filter(p => p.image_url && p.image_url.startsWith('r2:'));
  await Promise.all(r2Pages.map(p => deleteFromR2(p.image_url)));

  await Upload.deleteMany({ comic_id: comic._id });
  await Pages.deleteMany({ chapter_id: { $in: chapterIds } });
  await Chapter.deleteMany({ comic_id: comic._id });
  await Rating.deleteMany({ comic_id: comic._id });
  await ComicView.deleteMany({ comic_id: comic._id });
  await Comment.deleteMany({ comic_id: comic._id });
  await Favorite.deleteMany({ comic_id: comic._id });
  
  // Selective cache flush
  apiCache.flush('latest');
  apiCache.flush('popular');
  apiCache.flush('trending');
  apiCache.flush('homepage');
  apiCache.flush(`detail_${id}`);
  
  res.json({ message: "Comic deleted successfully" });
});

module.exports = {
  getLatestComics,
  getPopularComics,
  getAllComics,
  getTrendingComics,
  getComicById,
  getReaderData,
  getHomeData,
  createComic,
  updateComic,
  deleteComic
};
