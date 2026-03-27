const { User, Comic } = require('../../Database/database');
const { getChapterCounts } = require('../utils/helpers');
const { resolveR2Url } = require('../config/r2');

const getStudioComics = async (req, res) => {
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
};

module.exports = {
  getStudioComics
};
