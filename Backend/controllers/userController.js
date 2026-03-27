const { User, ComicView, Comic, Rating, Comment, Favorite } = require('../../Database/database');

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: "User không tồn tại" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User không tồn tại" });

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
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User không tồn tại" });

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
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getMe,
  deleteMe,
  deleteUser
};
