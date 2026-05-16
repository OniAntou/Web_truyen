import {  Comic, Favorite, ReadingProgress, Genre, Chapter  } from "../database";

// Helper for chapter counts to prevent N+1 queries
async function getChapterCounts(comicIds) {
  if (!comicIds || comicIds.length === 0) return {};
  const aggs = await Chapter.aggregate([
    { $match: { comic_id: { $in: comicIds } } },
    { $group: { _id: "$comic_id", count: { $sum: 1 } } }
  ]);
  const counts: any = {};
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
      const escapedG = g.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      let genreDoc = await Genre.findOne({ name: { $regex: new RegExp(`^${escapedG}$`, 'i') } });
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

// Helper: Validate MongoDB ObjectId
const isValidObjectId = (id: string) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

// Helper: Check if chapter should be locked based on price and early access
const isChapterRequiresLock = (chapter: any) => {
  if (!chapter.price || chapter.price <= 0) return false;
  if (chapter.early_access_end_date && new Date(chapter.early_access_end_date) <= new Date()) return false;
  return true;
};

// Helper: Full locking logic including user permissions
const isChapterLocked = (chapter: any, user: any, userDoc: any, unlockedChapters: Set<string>) => {
  if (!isChapterRequiresLock(chapter)) return false;
  
  if (user && userDoc) {
    if (userDoc.role === 'admin' || userDoc.role === 'creator') return false;
    if (userDoc.is_vip && userDoc.vip_expiry && new Date(userDoc.vip_expiry) > new Date()) return false;
    if (unlockedChapters.has(chapter._id.toString())) return false;
  }
  
  return true;
};

// Helper: Find comic by ID (supports both ObjectId and numeric id)
async function findComicById(id: string, selectFields: string = '', lean: boolean = true) {
  let query;
  if (isValidObjectId(id)) {
    query = Comic.findById(id);
  } else {
    const numericId = parseInt(id);
    if (isNaN(numericId)) return null;
    query = Comic.findOne({ id: numericId });
  }
  
  if (selectFields) {
    query = query.select(selectFields);
  }
  
  return lean ? query.lean() : query;
}

// Helper: Format large numbers (views/revenue)
const formatViews = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};

export { 
  getChapterCounts,
  processGenres,
  formatExactDate,
  syncLatestChapter,
  isValidObjectId,
  isChapterRequiresLock,
  isChapterLocked,
  findComicById,
  formatViews
 };
