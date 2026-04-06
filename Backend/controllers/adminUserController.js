const { User, ComicView, Comic, Rating, Comment, Favorite, Payment } = require('../../Database/database');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');

// GET /api/admin/users - List all users with search, filter, pagination
const getAllUsers = asyncHandler(async (req, res) => {
  const { search, role, vip, sort, order, page = 1, limit = 20 } = req.query;

  const filter = {};

  // Search by username or email
  if (search) {
    filter.$or = [
      { username: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  // Filter by role
  if (role && ['user', 'creator', 'admin'].includes(role)) {
    filter.role = role;
  }

  // Filter by VIP status
  if (vip === 'true') filter.is_vip = true;
  if (vip === 'false') filter.is_vip = false;

  // Sorting
  const sortField = sort || 'created_at';
  const sortOrder = order === 'asc' ? 1 : -1;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await User.countDocuments(filter);

  const users = await User.find(filter)
    .select('-password')
    .sort({ [sortField]: sortOrder })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  res.json({
    users,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit))
  });
});

// GET /api/admin/users/:id - Get single user details
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password').lean();
  if (!user) throw new AppError("User không tồn tại", 404);

  // Get additional stats
  const viewCount = await ComicView.countDocuments({ user_id: user._id });
  const ratingCount = await Rating.countDocuments({ user_id: user._id });
  const commentCount = await Comment.countDocuments({ user_id: user._id });
  const favoriteCount = await Favorite.countDocuments({ user_id: user._id });

  // Total spent
  const payments = await Payment.find({ user_id: user._id, status: 'success' });
  const totalSpent = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  res.json({
    ...user,
    stats: {
      views: viewCount,
      ratings: ratingCount,
      comments: commentCount,
      favorites: favoriteCount,
      totalSpent
    }
  });
});

// PUT /api/admin/users/:id - Update user (role, VIP, coins)
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError("User không tồn tại", 404);

  const { role, is_vip, coins, vip_expiry } = req.body;

  if (role !== undefined) {
    if (!['user', 'creator', 'admin'].includes(role)) {
      throw new AppError("Role không hợp lệ", 400);
    }
    user.role = role;
  }

  if (is_vip !== undefined) {
    user.is_vip = is_vip;
    if (is_vip && !user.vip_expiry) {
      // Auto-set 30 days VIP if enabling without expiry
      user.vip_expiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
    if (!is_vip) {
      user.vip_expiry = null;
    }
  }

  if (vip_expiry !== undefined) {
    user.vip_expiry = vip_expiry ? new Date(vip_expiry) : null;
  }

  if (coins !== undefined) {
    if (typeof coins !== 'number' || coins < 0) {
      throw new AppError("Coins phải là số không âm", 400);
    }
    user.coins = coins;
  }

  await user.save();

  const { password, ...safeUser } = user.toObject();
  res.json(safeUser);
});

// DELETE /api/admin/users/:id - Delete user with full cleanup
const adminDeleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError("User không tồn tại", 404);

  // Prevent deleting admin accounts
  if (user.role === 'admin') {
    throw new AppError("Không thể xóa tài khoản admin", 403);
  }

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

  // 3. Delete comments
  await Comment.deleteMany({ user_id: user._id });

  // 4. Delete favorites
  await Favorite.deleteMany({ user_id: user._id });

  // 5. Delete user
  await User.findByIdAndDelete(user._id);

  res.json({ message: `Đã xoá user "${user.username}" và hoàn tác các dữ liệu liên quan` });
});

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  adminDeleteUser
};
