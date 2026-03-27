const { Comic, Genre } = require('../../Database/database');
const { getChapterCounts, processGenres } = require('../utils/helpers');
const { resolveR2Url, deleteFromR2 } = require('../config/r2');
const { Chapter, Pages, Upload, Rating, ComicView, Comment, Favorite } = require('../../Database/database');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');

const getLatestComics = asyncHandler(async (req, res) => {
  const { genre, page = 1, limit = 20 } = req.query;
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
});

const getPopularComics = asyncHandler(async (req, res) => {
  const { genre, sort = "views", limit } = req.query;
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

  let comics = await Comic.find(filter).populate('genres', 'name slug');

  if (sort === "rating") {
    comics.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else if (sort === "newest") {
    comics.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } else {
    comics.sort((a, b) => (b.views || 0) - (a.views || 0));
  }

  if (limit) {
    comics = comics.slice(0, parseInt(limit));
  }

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

  const allGenres = await Genre.find().sort({ name: 1 }).select('name slug');
  res.json({ comics: results, genres: allGenres });
});

const getAllComics = asyncHandler(async (req, res) => {
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
});

const getTrendingComics = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;
  let comics = await Comic.find({}).sort({ weekly_views: -1 }).limit(parseInt(limit)).populate('genres', 'name slug');
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
});

const getComicById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  let comic;
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    comic = await Comic.findById(id);
  } else {
    comic = await Comic.findOne({ id: parseInt(id) });
  }

  if (!comic) throw new AppError("Comic not found", 404);

  const chapters = await Chapter.find({ comic_id: comic._id }).sort({ chapter_number: 1 });
  
  const formatExactDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const chaptersWithoutPages = chapters.map(ch => {
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
});

const createComic = asyncHandler(async (req, res) => {
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
});

const updateComic = asyncHandler(async (req, res) => {
  const { id } = req.params;
  let comic;
  const payload = { ...req.body };
  if (payload.genres) {
    payload.genres = await processGenres(payload.genres);
  }

  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    comic = await Comic.findByIdAndUpdate(id, payload, { new: true });
  } else {
    comic = await Comic.findOneAndUpdate({ id: parseInt(id) }, payload, { new: true });
  }

  if (!comic) throw new AppError("Comic not found", 404);
  res.json(comic);
});

const deleteComic = asyncHandler(async (req, res) => {
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

  res.json({ message: "Comic deleted successfully" });
});

module.exports = {
  getLatestComics,
  getPopularComics,
  getAllComics,
  getTrendingComics,
  getComicById,
  createComic,
  updateComic,
  deleteComic
};
