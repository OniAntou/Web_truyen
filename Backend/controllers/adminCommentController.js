const { Comment, Comic } = require('../../Database/database');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');

// GET /api/admin/comments - List all comments with search, filter, pagination
const getAllComments = asyncHandler(async (req, res) => {
  const { search, comicId, userId, page = 1, limit = 20 } = req.query;

  const filter = {};

  // Search by comment content
  if (search) {
    filter.content = { $regex: search, $options: 'i' };
  }

  // Filter by comic
  if (comicId) {
    filter.comic_id = comicId;
  }

  // Filter by user
  if (userId) {
    filter.user_id = userId;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Comment.countDocuments(filter);

  const comments = await Comment.find(filter)
    .populate('user_id', 'username email avatar')
    .populate('comic_id', 'title cover_url')
    .populate('chapter_id', 'title chapter_number')
    .populate('parent_id', 'content')
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  res.json({
    comments,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit))
  });
});

// GET /api/admin/comments/comics - Get comic list for filter dropdown
const getComicsForFilter = asyncHandler(async (req, res) => {
  const comics = await Comic.find()
    .select('title')
    .sort({ title: 1 })
    .lean();

  res.json(comics);
});

// DELETE /api/admin/comments/:id - Delete single comment + cascade replies
const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) throw new AppError("Bình luận không tồn tại", 404);

  // Delete the comment itself
  await Comment.findByIdAndDelete(comment._id);
  // Cascade delete all nested replies
  const cascadeResult = await Comment.deleteMany({ parent_id: comment._id });

  res.json({
    message: "Đã xoá bình luận thành công",
    deletedReplies: cascadeResult.deletedCount
  });
});

// DELETE /api/admin/comments/bulk - Bulk delete comments
const bulkDeleteComments = asyncHandler(async (req, res) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    throw new AppError("Danh sách ID không hợp lệ", 400);
  }

  // Also cascade delete replies for each comment
  const cascadeResult = await Comment.deleteMany({ parent_id: { $in: ids } });
  const mainResult = await Comment.deleteMany({ _id: { $in: ids } });

  res.json({
    message: `Đã xoá ${mainResult.deletedCount} bình luận`,
    deletedComments: mainResult.deletedCount,
    deletedReplies: cascadeResult.deletedCount
  });
});

module.exports = {
  getAllComments,
  getComicsForFilter,
  deleteComment,
  bulkDeleteComments
};
