const { Genre, Comic } = require('../../Database/database');
const { getChapterCounts } = require('../utils/helpers');
const { resolveR2Url } = require('../config/r2');

const getGenres = async (req, res) => {
  try {
    const { genre, sort = 'views' } = req.query;

    const allGenres = await Genre.find().sort({ name: 1 });

    const genres = await Promise.all(allGenres.map(async (g) => {
      const count = await Comic.countDocuments({ genres: g._id });
      return { _id: g._id, name: g.name, slug: g.slug, description: g.description, count };
    }));

    let comics = [];
    if (genre) {
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
};

const getGenreList = async (req, res) => {
  try {
    const genres = await Genre.find().sort({ name: 1 });
    res.json(genres);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getGenreByIdOrSlug = async (req, res) => {
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
};

const createGenre = async (req, res) => {
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
};

const updateGenre = async (req, res) => {
  try {
    const genre = await Genre.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!genre) return res.status(404).json({ message: 'Genre không tồn tại' });
    res.json(genre);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteGenre = async (req, res) => {
  try {
    const genre = await Genre.findByIdAndDelete(req.params.id);
    if (!genre) return res.status(404).json({ message: 'Genre không tồn tại' });
    res.json({ message: 'Đã xoá genre thành công' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getGenres,
  getGenreList,
  getGenreByIdOrSlug,
  createGenre,
  updateGenre,
  deleteGenre
};
