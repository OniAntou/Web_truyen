import {  User, ComicView, Comic, Rating, Comment, Favorite, Payment, ChapterUnlock  } from "../database";
import { resolveR2Url } from "../config/r2";
import asyncHandler from "../middleware/asyncHandler";
import AppError from "../utils/AppError";
import bcrypt from "bcryptjs";

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password').lean() as any;
  if (!user) throw new AppError("User không tồn tại", 404);
  
  if (user.avatar_url) {
    user.avatar_url = await resolveR2Url(user.avatar_url);
  }
  
  res.json(user);
});

const deleteMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw new AppError("User không tồn tại", 404);

  // 1. Rollback views
  const userViews = await ComicView.find({ user_id: user._id });
  const viewComicIds = userViews.map(v => v.comic_id);
  if (viewComicIds.length > 0) {
    await Comic.updateMany({ _id: { $in: viewComicIds } }, { $inc: { views: -1 } });
  }
  await ComicView.deleteMany({ user_id: user._id });

  // 2. Rollback ratings
  const userRatings = await Rating.find({ user_id: user._id });
  const ratingComicIds = userRatings.map(r => r.comic_id);
  
  if (ratingComicIds.length > 0) {
    // Recalculate averages for affected comics
    for (const comicId of ratingComicIds) {
      const comic = await Comic.findById(comicId);
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
  const viewComicIds = userViews.map(v => v.comic_id);
  if (viewComicIds.length > 0) {
    await Comic.updateMany({ _id: { $in: viewComicIds } }, { $inc: { views: -1 } });
  }
  await ComicView.deleteMany({ user_id: user._id });

  // 2. Rollback ratings
  const userRatings = await Rating.find({ user_id: user._id });
  const ratingComicIds = userRatings.map(r => r.comic_id);
  
  if (ratingComicIds.length > 0) {
    for (const comicId of ratingComicIds) {
      const comic = await Comic.findById(comicId);
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
  const VIP_PRICE = 50000;
  const now = new Date();
  const durationMs = 30 * 24 * 60 * 60 * 1000;
  const user = await User.findOneAndUpdate(
    { _id: req.user.id, coins: { $gte: VIP_PRICE } },
    [{
      $set: {
        coins: { $subtract: ["$coins", VIP_PRICE] },
        is_vip: true,
        vip_expiry: {
          $cond: [
            { $gt: ["$vip_expiry", now] },
            { $add: ["$vip_expiry", durationMs] },
            { $add: [now, durationMs] },
          ],
        },
      },
    }],
    { new: true },
  );

  if (!user) {
    if (!await User.exists({ _id: req.user.id })) throw new AppError("User không tồn tại", 404);
    throw new AppError("Bạn không đủ Coins để nâng cấp VIP.", 400);
  }

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
  const safeUser = user.toObject() as any;
  delete safeUser.password;
  
  if (safeUser.avatar_url) {
    safeUser.avatar_url = await resolveR2Url(safeUser.avatar_url);
  }
  
  res.json(safeUser);
});

const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw new AppError("User không tồn tại", 404);

  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new AppError("Vui lòng nhập mật khẩu cũ và mới", 400);
  }

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    throw new AppError("Mật khẩu hiện tại không đúng", 400);
  }

  if (newPassword.length < 6) {
    throw new AppError("Mật khẩu mới phải có ít nhất 6 ký tự", 400);
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();

  res.json({ message: "Đổi mật khẩu thành công" });
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

export { 
  getMe,
  updateMe,
  changePassword,
  deleteMe,
  deleteUser,
  upgradeVip,
  getTransactions
 };
