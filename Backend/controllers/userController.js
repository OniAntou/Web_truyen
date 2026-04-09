const { User, ComicView, Comic, Rating, Comment, Favorite, Payment, ChapterUnlock } = require('../../Database/database');
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

const upgradeVip = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw new AppError("User không tồn tại", 404);

  const VIP_PRICE = 50000;
  if (user.coins < VIP_PRICE) {
    throw new AppError("Bạn không đủ Coins để nâng cấp VIP.", 400);
  }

  user.coins -= VIP_PRICE;
  user.is_vip = true;

  const now = new Date();
  if (user.vip_expiry && user.vip_expiry > now) {
    user.vip_expiry = new Date(user.vip_expiry.getTime() + 30 * 24 * 60 * 60 * 1000);
  } else {
    user.vip_expiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  }

  await user.save();

  res.json({ message: "Nâng cấp VIP thành công!", user: { coins: user.coins, is_vip: user.is_vip, vip_expiry: user.vip_expiry } });
});

const updateMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw new AppError("User không tồn tại", 404);

  const { username, email } = req.body;

  if (username !== undefined) {
    const trimmed = username.trim();
    if (!trimmed || trimmed.length < 2) throw new AppError("Username phải có ít nhất 2 ký tự", 400);
    user.username = trimmed;
  }

  if (email !== undefined) {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) throw new AppError("Email không được để trống", 400);
    // Check if email is already used by another user
    const existing = await User.findOne({ email: trimmed, _id: { $ne: user._id } });
    if (existing) throw new AppError("Email này đã được sử dụng", 409);
    user.email = trimmed;
  }

  await user.save();
  const { password, ...safeUser } = user.toObject();
  res.json(safeUser);
});

const getTransactions = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  // Get payments (top ups)
  const payments = await Payment.find({ user_id: userId })
    .sort({ created_at: -1 })
    .limit(50);
    
  // Get chapter unlocks (spending)
  const unlocks = await ChapterUnlock.find({ user_id: userId })
    .populate({
      path: 'chapter_id',
      select: 'chapter_number title comic_id',
      populate: {
        path: 'comic_id',
        select: 'title'
      }
    })
    .sort({ created_at: -1 })
    .limit(50);

  res.json({ payments, unlocks });
});

module.exports = {
  getMe,
  updateMe,
  deleteMe,
  deleteUser,
  upgradeVip,
  getTransactions
};
