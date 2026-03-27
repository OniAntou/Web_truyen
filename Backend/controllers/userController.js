const { User, ComicView, Comic, Rating, Comment, Favorite } = require('../../Database/database');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  if (!user) throw new AppError("User không tồn tại", 404);
  res.json(user);
});

const deleteMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw new AppError("User không tồn tại", 404);

  // 1. Rollback views
  const userViews = await ComicView.find({ user_id: user._id });
  for (const view of userViews) {
    await Comic.findByIdAndUpdate(view.comic_id, { $inc: { views: -1 } });
  }
  await ComicView.deleteMany({ user_id: user._id });

  // 2. Rollback ratings
  const userRatings = await Rating.find({ user_id: user._id });
  for (const rating of userRatings) {
    const comic = await Comic.findById(rating.comic_id);
    if (comic) {
      const result = await Rating.aggregate([
        { $match: { comic_id: comic._id, user_id: { $ne: user._id } } },
        { $group: { _id: null, avgRating: { $avg: "$rating" } } }
      ]);
      const avg = result.length > 0 ? result[0].avgRating : 0;
      const newAvg = Number(avg.toFixed(1));
      const newCount = Math.max(0, (comic.rating_count || 1) - 1);
      await Comic.updateOne(
        { _id: comic._id },
        { $set: { rating: newAvg, rating_count: newCount } }
      );
    }
  }
  await Rating.deleteMany({ user_id: user._id });

  // 2.5 Rollback comments
  await Comment.deleteMany({ user_id: user._id });

  // 2.6 Rollback favorites
  await Favorite.deleteMany({ user_id: user._id });

  // 3. Delete user
  await User.findByIdAndDelete(user._id);

  res.json({ message: "Tài khoản của bạn đã được xóa thành công." });
});

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) throw new AppError("User không tồn tại", 404);

  // 1. Rollback views
  const userViews = await ComicView.find({ user_id: user._id });
  for (const view of userViews) {
    await Comic.findByIdAndUpdate(view.comic_id, { $inc: { views: -1 } });
  }
  await ComicView.deleteMany({ user_id: user._id });

  // 2. Rollback ratings
  const userRatings = await Rating.find({ user_id: user._id });
  for (const rating of userRatings) {
    const comic = await Comic.findById(rating.comic_id);
    if (comic) {
      // Recalculate average rating for comic (omitting this user's rating)
      const result = await Rating.aggregate([
        { $match: { comic_id: comic._id, user_id: { $ne: user._id } } },
        { $group: { _id: null, avgRating: { $avg: "$rating" } } }
      ]);
      const avg = result.length > 0 ? result[0].avgRating : 0;
      const newAvg = Number(avg.toFixed(1));
      const newCount = Math.max(0, (comic.rating_count || 1) - 1);
      await Comic.updateOne(
        { _id: comic._id },
        { $set: { rating: newAvg, rating_count: newCount } }
      );
    }
  }
  await Rating.deleteMany({ user_id: user._id });

  // 2.5 Rollback comments
  await Comment.deleteMany({ user_id: user._id });

  // 2.6 Rollback favorites
  await Favorite.deleteMany({ user_id: user._id });

  // 3. Delete user
  await User.findByIdAndDelete(user._id);

  res.json({ message: "Đã xoá user và hoàn tác các lượt view/rating liên quan" });
});

module.exports = {
  getMe,
  deleteMe,
  deleteUser
};
