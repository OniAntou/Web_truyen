const { Genre, Comic } = require('../Database/database');
const { getChapterCounts } = require('../utils/helpers');
const { resolveR2Url } = require('../config/r2');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');

const getGenres = asyncHandler(async (req, res) => {
  const { genre, sort = 'views' } = req.query;

  const allGenres = await Genre.find().sort({ name: 1 });

  const genres = await Promise.all(allGenres.map(async (g) => {
    const count = await Comic.countDocuments({ genres: g._id });
    return { _id: g._id, name: g.name, slug: g.slug, description: g.description, count };
  }));

  let comics = [];
  if (genre) {
    const genreStr = String(genre);
    const escapedGenre = genreStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const genreDoc = await Genre.findOne({
      $or: [
        { name: { $regex: new RegExp(`^${escapedGenre}$`, 'i') } },
        { slug: genreStr.toLowerCase() }
      ]
    });

    if (genreDoc) {
      const sortOption = {};
      if (sort === 'rating') {
        sortOption.rating = -1;
      } else if (sort === 'newest') {
        sortOption.created_at = -1;
      } else {
        sortOption.views = -1;
      }

      const filtered = await Comic.find({ genres: genreDoc._id })
        .populate('genres', 'name slug')
        .sort(sortOption)
        .limit(20); // Default limit for genre page

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
});

const getGenreList = asyncHandler(async (req, res) => {
  const genres = await Genre.find().sort({ name: 1 });
  res.json(genres);
});

const getGenreByIdOrSlug = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  let genre;
  if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
    genre = await Genre.findById(idOrSlug);
  } else {
    genre = await Genre.findOne({ slug: idOrSlug });
  }
  if (!genre) throw new AppError('Genre không tồn tại', 404);
  res.json(genre);
});

const createGenre = asyncHandler(async (req, res) => {
  const { name, slug, description } = req.body;
  if (!name || !slug) {
    throw new AppError('Cần có name và slug', 400);
  }
  const existing = await Genre.findOne({ $or: [{ name }, { slug }] });
  if (existing) {
    throw new AppError('Genre đã tồn tại (trùng name hoặc slug)', 409);
  }
  const genre = await Genre.create({ name, slug, description });
  res.status(201).json(genre);
});

const updateGenre = asyncHandler(async (req, res) => {
  const genre = await Genre.findByIdAndUpdate(String(req.params.id), req.body, { new: true });
  if (!genre) throw new AppError('Genre không tồn tại', 404);
  res.json(genre);
});

const deleteGenre = asyncHandler(async (req, res) => {
  const genre = await Genre.findByIdAndDelete(String(req.params.id));
  if (!genre) throw new AppError('Genre không tồn tại', 404);
  res.json({ message: 'Đã xoá genre thành công' });
});

module.exports = {
  getGenres,
  getGenreList,
  getGenreByIdOrSlug,
  createGenre,
  updateGenre,
  deleteGenre
};
