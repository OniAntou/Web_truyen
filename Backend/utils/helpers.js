const { Comic, Favorite, ReadingProgress, Genre, Chapter } = require('../Database/database');

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

// Helper: Format exact date (DD/MM/YYYY)
const formatExactDate = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

// Update comic's latest_chapter denormalized field
async function syncLatestChapter(comicId) {
  try {
    const latestChapter = await Chapter.findOne({ comic_id: comicId })
      .sort({ chapter_number: -1 })
      .select("_id chapter_number title created_at")
      .lean();

    if (latestChapter) {
      await Comic.findByIdAndUpdate(comicId, {
        $set: {
          latest_chapter: {
            id: latestChapter._id,
            chapter_number: latestChapter.chapter_number,
            title: latestChapter.title,
            created_at: latestChapter.created_at,
          },
        },
      });
    } else {
      await Comic.findByIdAndUpdate(comicId, {
        $unset: { latest_chapter: "" },
      });
    }
  } catch (err) {
    console.error(`Error syncing latest chapter for comic ${comicId}:`, err);
  }
}

module.exports = {
  getChapterCounts,
  processGenres,
  formatExactDate,
  syncLatestChapter,
};
