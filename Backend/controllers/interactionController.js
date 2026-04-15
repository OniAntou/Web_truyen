const { Comic, Rating, ComicView, Comment, Favorite, ReadingProgress, Chapter, Pages } = require('../Database/database');
const { getChapterCounts } = require('../utils/helpers');
const { resolveR2Url } = require('../config/r2');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');
const apiCache = require('../utils/cache');

// Helper: find comic by ObjectId or legacy numeric id
const findComic = async (id) => {
  if (id.match(/^[0-9a-fA-F]{24}$/)) return Comic.findById(id);
  return Comic.findOne({ id: parseInt(id) });
};

// Ratings
const getUserRating = asyncHandler(async (req, res) => {
  const comic = await findComic(req.params.id);
  if (!comic) throw new AppError("Comic không tồn tại", 404);

  const rating = await Rating.findOne({ user_id: req.user.id, comic_id: comic._id });
  res.json({ rating: rating ? rating.rating : 0 });
});

const submitRating = asyncHandler(async (req, res) => {
  const { rating } = req.body;
  
  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    throw new AppError("Rating phải từ 1 đến 5", 400);
  }

  const comic = await findComic(req.params.id);
  if (!comic) throw new AppError("Comic không tồn tại", 404);

  const existingRating = await Rating.findOne({ user_id: req.user.id, comic_id: comic._id });
  
  let newRatingCount = comic.rating_count || 0;
  if (existingRating) {
    existingRating.rating = rating;
    await existingRating.save();
  } else {
    await Rating.create({ user_id: req.user.id, comic_id: comic._id, rating });
    newRatingCount += 1;
  }

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

  // Flush relevant caches
  apiCache.flush('homepage');
  apiCache.flush('popular');
  apiCache.flush('latest');
  apiCache.flush('trending');
  apiCache.flush(`detail_public_${comic.id}`);
  apiCache.flush(`detail_public_${comic._id}`);

  res.json({ message: "Đánh giá thành công", rating: newAvg, user_rating: rating, rating_count: newRatingCount });
});

// Views
const recordView = asyncHandler(async (req, res) => {
  const comic = await findComic(req.params.id);
  if (!comic) throw new AppError("Comic không tồn tại", 404);

  const existingView = await ComicView.findOne({ user_id: req.user.id, comic_id: comic._id });
  if (!existingView) {
    await ComicView.create({ user_id: req.user.id, comic_id: comic._id });
    await Comic.updateOne({ _id: comic._id }, { $inc: { views: 1, weekly_views: 1 } });
    comic.views = (comic.views || 0) + 1;
    comic.weekly_views = (comic.weekly_views || 0) + 1;

    // Flush cache occasionally or for homepage
    apiCache.flush('homepage');
    apiCache.flush('trending');
  }
  
  res.json({ message: "Lượt xem đã được ghi nhận", views: comic.views, weekly_views: comic.weekly_views });
});

// Comments
const getComments = asyncHandler(async (req, res) => {
  const { chapterId } = req.query;
  const comic = await findComic(req.params.id);
  if (!comic) throw new AppError("Comic không tồn tại", 404);

  let filter = { comic_id: comic._id };
  if (chapterId) {
    filter.chapter_id = chapterId;
  } else {
    filter.chapter_id = null;
  }

  const comments = await Comment.find(filter)
    .populate('user_id', 'username avatar')
    .sort({ created_at: -1 });
    
  res.json(comments);
});

const postComment = asyncHandler(async (req, res) => {
  const { content, parentId, chapterId } = req.body;
  
  if (!content || !content.trim()) throw new AppError("Nội dung không được để trống", 400);

  const comic = await findComic(req.params.id);
  if (!comic) throw new AppError("Comic không tồn tại", 404);

  const payload = {
    user_id: req.user.id,
    comic_id: comic._id,
    content: content.trim()
  };
  
  if (chapterId) payload.chapter_id = chapterId;
  if (parentId) payload.parent_id = parentId;

  const newComment = await Comment.create(payload);

  const populatedComment = await Comment.findById(newComment._id).populate('user_id', 'username avatar');
  
  res.json({ message: "Đăng bình luận thành công", comment: populatedComment });
});

const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.commentId);
  if (!comment) throw new AppError("Bình luận không tồn tại", 404);

  // Allow delete if user is the comment owner OR is an admin
  const isOwner = comment.user_id.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    throw new AppError("Bạn không có quyền xoá bình luận này", 403);
  }

  await Comment.findByIdAndDelete(comment._id);
  // Delete all nested replies associated with this comment
  await Comment.deleteMany({ parent_id: comment._id });
  
  res.json({ message: "Đã xoá bình luận thành công" });
});

// Favorites
const checkFavorite = asyncHandler(async (req, res) => {
  const comic = await findComic(req.params.id);
  if (!comic) throw new AppError("Comic không tồn tại", 404);

  const favorite = await Favorite.findOne({ user_id: req.user.id, comic_id: comic._id });
  res.json({ isFavorited: !!favorite });
});

const getUserFavorites = asyncHandler(async (req, res) => {
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
});

const toggleFavorite = asyncHandler(async (req, res) => {
  const comic = await findComic(req.params.id);
  if (!comic) throw new AppError("Comic không tồn tại", 404);

  const existingFavorite = await Favorite.findOne({ user_id: req.user.id, comic_id: comic._id });
  
  if (existingFavorite) {
    await Favorite.findByIdAndDelete(existingFavorite._id);
    
    apiCache.flush('homepage');
    apiCache.flush(`detail_public_${comic.id}`);
    apiCache.flush(`detail_public_${comic._id}`);

    res.json({ message: "Đã hủy yêu thích", isFavorited: false });
  } else {
    await Favorite.create({ user_id: req.user.id, comic_id: comic._id });

    apiCache.flush('homepage');
    apiCache.flush(`detail_public_${comic.id}`);
    apiCache.flush(`detail_public_${comic._id}`);

    res.json({ message: "Đã thêm vào yêu thích", isFavorited: true });
  }
});

// Reading Progress
const getReadingProgress = asyncHandler(async (req, res) => {
  const comic = await findComic(req.params.id);
  if (!comic) throw new AppError("Comic không tồn tại", 404);

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
});

const updateReadingProgress = asyncHandler(async (req, res) => {
  const { chapter_id, page_number = 1 } = req.body;
  
  if (!chapter_id) {
    throw new AppError("Thiếu chapter_id", 400);
  }

  const comic = await findComic(req.params.id);
  if (!comic) throw new AppError("Comic không tồn tại", 404);

  const chapter = await Chapter.findOne({ _id: chapter_id, comic_id: comic._id });
  if (!chapter) {
    throw new AppError("Chapter không tồn tại hoặc không thuộc comic này", 404);
  }

  const existingProgress = await ReadingProgress.findOne({ 
    user_id: req.user.id, 
    comic_id: comic._id 
  });

  if (existingProgress) {
    existingProgress.chapter_id = chapter_id;
    existingProgress.page_number = page_number;
    existingProgress.updated_at = new Date();
    await existingProgress.save();
  } else {
    await ReadingProgress.create({
      user_id: req.user.id,
      comic_id: comic._id,
      chapter_id: chapter_id,
      page_number: page_number
    });
  }

  res.json({ message: "Reading progress updated successfully" });
});

const getAllReadingProgress = asyncHandler(async (req, res) => {
  const progresses = await ReadingProgress.find({ user_id: req.user.id })
    .populate({
      path: 'comic_id',
      populate: { path: 'genres', select: 'name slug' }
    })
    .populate('chapter_id', 'title chapter_number')
    .sort({ updated_at: -1 })
    .limit(20);

  const results = [];
  for (const progress of progresses) {
    if (!progress.comic_id || !progress.chapter_id) continue;

    const coverUrl = await resolveR2Url(progress.comic_id.cover_url);
    results.push({
      comic_id: progress.comic_id._id,
      comic_id_legacy: progress.comic_id.id,
      comic_title: progress.comic_id.title,
      comic_cover: coverUrl || progress.comic_id.cover_url,
      chapter_id: progress.chapter_id._id,
      chapter_number: progress.chapter_id.chapter_number,
      chapter_title: progress.chapter_id.title,
      page_number: progress.page_number,
      updated_at: progress.updated_at,
      genres: progress.comic_id.genres
    });
  }

  res.json(results);
});

const getChapterReadStatus = asyncHandler(async (req, res) => {
  const comic = await findComic(req.params.id);
  if (!comic) throw new AppError("Comic không tồn tại", 404);

  const chapters = await Chapter.find({ comic_id: comic._id })
    .sort({ chapter_number: 1 })
    .select('_id chapter_number title');

  const progresses = await ReadingProgress.find({ 
    user_id: req.user.id, 
    comic_id: comic._id 
  }).select('chapter_id page_number');

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

  const progressMap = {};
  progresses.forEach(progress => {
    if (!progress.chapter_id) return;
    const chapterId = progress.chapter_id.toString();
    const totalPages = pageCountMap[chapterId] || 1;
    
    progressMap[chapterId] = {
        hasProgress: true,
        current_page: progress.page_number,
        isRead: progress.page_number > 0,
        totalPages: totalPages
    };
  });

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
});

module.exports = {
  getUserRating,
  submitRating,
  recordView,
  getComments,
  postComment,
  deleteComment,
  checkFavorite,
  getUserFavorites,
  toggleFavorite,
  getReadingProgress,
  updateReadingProgress,
  getAllReadingProgress,
  getChapterReadStatus
};
