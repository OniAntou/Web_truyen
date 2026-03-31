const { User, Comic } = require('../../Database/database');
const { getChapterCounts } = require('../utils/helpers');
const { resolveR2Url } = require('../config/r2');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');

const getStudioComics = asyncHandler(async (req, res) => {
  if (!req.user || (req.user.role !== 'creator' && req.user.role !== 'admin')) {
    throw new AppError("Bạn không có quyền truy cập Creator Studio.", 403);
  }

  const comics = await Comic.find({ uploader_id: req.user.id }).sort({ created_at: -1 }).populate('genres', 'name slug');
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

module.exports = {
  getStudioComics
};
