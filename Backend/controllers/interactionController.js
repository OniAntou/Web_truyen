const { Comic, Rating, ComicView, Comment, Favorite, ReadingProgress, Chapter, Pages } = require('../../Database/database');
const { getChapterCounts } = require('../utils/helpers');
const { resolveR2Url } = require('../config/r2');

// Ratings
const getUserRating = async (req, res) => {
  try {
    const { id } = req.params;
    let comic;
    if (id.match(/^[0-9a-fA-F]{24}$/)) comic = await Comic.findById(id);
    else comic = await Comic.findOne({ id: parseInt(id) });
    
    if (!comic) return res.status(404).json({ message: "Comic không tồn tại" });

    const rating = await Rating.findOne({ user_id: req.user.id, comic_id: comic._id });
    res.json({ rating: rating ? rating.rating : 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const submitRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating phải từ 1 đến 5" });
    }

    let comic;
    if (id.match(/^[0-9a-fA-F]{24}$/)) comic = await Comic.findById(id);
    else comic = await Comic.findOne({ id: parseInt(id) });
    
    if (!comic) return res.status(404).json({ message: "Comic không tồn tại" });

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

    res.json({ message: "Đánh giá thành công", rating: newAvg, user_rating: rating, rating_count: newRatingCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Views
const recordView = async (req, res) => {
  try {
    const { id } = req.params;
    let comic;
    if (id.match(/^[0-9a-fA-F]{24}$/)) comic = await Comic.findById(id);
    else comic = await Comic.findOne({ id: parseInt(id) });
    
    if (!comic) return res.status(404).json({ message: "Comic không tồn tại" });

    const existingView = await ComicView.findOne({ user_id: req.user.id, comic_id: comic._id });
    if (!existingView) {
      await ComicView.create({ user_id: req.user.id, comic_id: comic._id });
      await Comic.updateOne({ _id: comic._id }, { $inc: { views: 1, weekly_views: 1 } });
      comic.views = (comic.views || 0) + 1;
      comic.weekly_views = (comic.weekly_views || 0) + 1;
    }
    
    res.json({ message: "Lượt xem đã được ghi nhận", views: comic.views, weekly_views: comic.weekly_views });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Comments
const getComments = async (req, res) => {
  try {
    const { id } = req.params;
    const { chapterId } = req.query;
    let comic;
    if (id.match(/^[0-9a-fA-F]{24}$/)) comic = await Comic.findById(id);
    else comic = await Comic.findOne({ id: parseInt(id) });
    
    if (!comic) return res.status(404).json({ message: "Comic không tồn tại" });

    let filter = { comic_id: comic._id };
    if (chapterId) {
      filter.chapter_id = chapterId;
    } else {
      filter.chapter_id = { $exists: false };
    }

    const comments = await Comment.find(filter)
      .populate('user_id', 'username avatar')
      .sort({ created_at: -1 });
      
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const postComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    
    if (!content || !content.trim()) return res.status(400).json({ message: "Nội dung không được để trống" });

    let comic;
    if (id.match(/^[0-9a-fA-F]{24}$/)) comic = await Comic.findById(id);
    else comic = await Comic.findOne({ id: parseInt(id) });
    
    if (!comic) return res.status(404).json({ message: "Comic không tồn tại" });

    const newComment = await Comment.create({
      user_id: req.user.id,
      comic_id: comic._id,
      content: content.trim()
    });

    const populatedComment = await Comment.findById(newComment._id).populate('user_id', 'username avatar');
    
    res.json({ message: "Đăng bình luận thành công", comment: populatedComment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Favorites
const checkFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    let comic;
    if (id.match(/^[0-9a-fA-F]{24}$/)) comic = await Comic.findById(id);
    else comic = await Comic.findOne({ id: parseInt(id) });
    
    if (!comic) return res.status(404).json({ message: "Comic không tồn tại" });

    const favorite = await Favorite.findOne({ user_id: req.user.id, comic_id: comic._id });
    res.json({ isFavorited: !!favorite });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getUserFavorites = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const toggleFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    let comic;
    if (id.match(/^[0-9a-fA-F]{24}$/)) comic = await Comic.findById(id);
    else comic = await Comic.findOne({ id: parseInt(id) });
    
    if (!comic) return res.status(404).json({ message: "Comic không tồn tại" });

    const existingFavorite = await Favorite.findOne({ user_id: req.user.id, comic_id: comic._id });
    
    if (existingFavorite) {
      await Favorite.findByIdAndDelete(existingFavorite._id);
      res.json({ message: "Đã hủy yêu thích", isFavorited: false });
    } else {
      await Favorite.create({ user_id: req.user.id, comic_id: comic._id });
      res.json({ message: "Đã thêm vào yêu thích", isFavorited: true });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reading Progress
const getReadingProgress = async (req, res) => {
  try {
    const { id } = req.params;
    let comic;
    if (id.match(/^[0-9a-fA-F]{24}$/)) comic = await Comic.findById(id);
    else comic = await Comic.findOne({ id: parseInt(id) });
    
    if (!comic) return res.status(404).json({ message: "Comic không tồn tại" });

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
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateReadingProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { chapter_id, page_number = 1 } = req.body;
    
    if (!chapter_id) {
      return res.status(400).json({ message: "Thiếu chapter_id" });
    }

    let comic;
    if (id.match(/^[0-9a-fA-F]{24}$/)) comic = await Comic.findById(id);
    else comic = await Comic.findOne({ id: parseInt(id) });
    
    if (!comic) return res.status(404).json({ message: "Comic không tồn tại" });

    const chapter = await Chapter.findOne({ _id: chapter_id, comic_id: comic._id });
    if (!chapter) {
      return res.status(404).json({ message: "Chapter không tồn tại hoặc không thuộc comic này" });
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
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllReadingProgress = async (req, res) => {
  try {
    const progresses = await ReadingProgress.find({ user_id: req.user.id })
      .populate({
        path: 'comic_id',
        populate: { path: 'genres', select: 'name slug' }
      })
      .populate('chapter_id', 'title chapter_number')
      .sort({ updated_at: -1 })
      .limit(10);

    const results = await Promise.all(progresses.map(async (progress) => {
      const coverUrl = await resolveR2Url(progress.comic_id.cover_url);
      return {
        comic_id: progress.comic_id._id,
        comic_title: progress.comic_id.title,
        comic_cover: coverUrl || progress.comic_id.cover_url,
        chapter_id: progress.chapter_id._id,
        chapter_number: progress.chapter_id.chapter_number,
        chapter_title: progress.chapter_id.title,
        page_number: progress.page_number,
        updated_at: progress.updated_at,
        genres: progress.comic_id.genres
      };
    }));

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getChapterReadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    let comic;
    if (id.match(/^[0-9a-fA-F]{24}$/)) comic = await Comic.findById(id);
    else comic = await Comic.findOne({ id: parseInt(id) });
    
    if (!comic) return res.status(404).json({ message: "Comic không tồn tại" });

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
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getUserRating,
  submitRating,
  recordView,
  getComments,
  postComment,
  checkFavorite,
  getUserFavorites,
  toggleFavorite,
  getReadingProgress,
  updateReadingProgress,
  getAllReadingProgress,
  getChapterReadStatus
};
