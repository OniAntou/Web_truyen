import {  Comment, Comic  } from "../Database/database";
import asyncHandler from "../middleware/asyncHandler";
import AppError from "../utils/AppError";

// GET /api/admin/comments - List all comments with search, filter, pagination
const getAllComments = asyncHandler(async (req, res) => {
  const search = req.query.search ? String(req.query.search) : undefined;
  const comicId = req.query.comicId ? String(req.query.comicId) : undefined;
  const userId = req.query.userId ? String(req.query.userId) : undefined;
  const page = parseInt(String(req.query.page || '1'));
  const limit = parseInt(String(req.query.limit || '20'));

  const filter: any = {};

  // Search by comment content
  if (search) {
    const escapedSearch = String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.content = { $regex: escapedSearch, $options: 'i' };
  }

  // Filter by comic
  if (comicId) {
    filter.comic_id = String(comicId);
  }

  // Filter by user
  if (userId) {
    filter.user_id = String(userId);
  }

  const skip = (page - 1) * limit;
  const total = await Comment.countDocuments(filter);

  const comments = await Comment.find(filter)
    .populate('user_id', 'username email avatar')
    .populate('comic_id', 'title cover_url')
    .populate('chapter_id', 'title chapter_number')
    .populate('parent_id', 'content')
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  res.json({
    comments,
    total,
    page: page,
    totalPages: Math.ceil(total / limit)
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
  const comment = await Comment.findById(String(req.params.id));
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

  const safeIds = ids.map(id => String(id));

  // Also cascade delete replies for each comment
  const cascadeResult = await Comment.deleteMany({ parent_id: { $in: safeIds } });
  const mainResult = await Comment.deleteMany({ _id: { $in: safeIds } });

  res.json({
    message: `Đã xoá ${mainResult.deletedCount} bình luận`,
    deletedComments: mainResult.deletedCount,
    deletedReplies: cascadeResult.deletedCount
  });
});

export { 
  getAllComments,
  getComicsForFilter,
  deleteComment,
  bulkDeleteComments
 };
