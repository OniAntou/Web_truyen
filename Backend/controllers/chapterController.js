const { Chapter, Pages, Upload, User, ChapterUnlock } = require('../../Database/database');
const { resolveR2Url, deleteFromR2 } = require('../config/r2');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');

const getChapterPages = asyncHandler(async (req, res) => {
  const chapter = await Chapter.findById(req.params.chapterId);
  if (!chapter) throw new AppError("Chapter không tồn tại", 404);

  // Check Early Access Lock
  if (chapter.early_access_end_date && new Date(chapter.early_access_end_date) > new Date()) {
    let hasAccess = false;
    if (req.user) {
      if (req.user.role === 'admin' || req.user.role === 'creator') {
        hasAccess = true;
      } else {
        const fullUser = await User.findById(req.user.id);
        if (fullUser && fullUser.is_vip && fullUser.vip_expiry && new Date(fullUser.vip_expiry) > new Date()) {
          hasAccess = true;
        } else {
          const unlocked = await ChapterUnlock.findOne({ user_id: req.user.id, chapter_id: chapter._id });
          if (unlocked) hasAccess = true;
        }
      }
    }

    if (!hasAccess) {
      return res.status(403).json({
        is_locked: true,
        price: chapter.price || 0,
        early_access_end_date: chapter.early_access_end_date,
        message: "Chapter is locked. Requires VIP or " + (chapter.price || 0) + " coins."
      });
    }
  }

  const pages = await Pages.find({ chapter_id: chapter._id }).sort({ page_number: 1 });
  const pagesWithUrls = await Promise.all(
    pages.map(async (p) => ({
      _id: p._id,
      page_number: p.page_number,
      image_url: (await resolveR2Url(p.image_url)) || p.image_url,
    }))
  );
  res.json(pagesWithUrls);
});

const unlockChapter = asyncHandler(async (req, res) => {
  const chapter = await Chapter.findById(req.params.chapterId);
  if (!chapter) throw new AppError("Chapter không tồn tại", 404);

  if (!chapter.price || chapter.price <= 0 || (chapter.early_access_end_date && new Date(chapter.early_access_end_date) <= new Date())) {
    return res.json({ message: "Chương này không yêu cầu mở khóa." });
  }

  const user = await User.findById(req.user.id);

  if (user.is_vip && user.vip_expiry && new Date(user.vip_expiry) > new Date()) {
    return res.json({ message: "Bạn là VIP nên có thể đọc miễn phí chương này." });
  }
  
  const existingUnlock = await ChapterUnlock.findOne({ user_id: user._id, chapter_id: chapter._id });
  if (existingUnlock) {
    return res.json({ message: "Bạn đã mở khóa chương này rồi." });
  }

  if (user.coins < chapter.price) {
    throw new AppError("Bạn không đủ Coins để mở khóa. Vui lòng nạp thêm.", 403);
  }

  user.coins -= chapter.price;
  await user.save();

  await ChapterUnlock.create({
    user_id: user._id,
    chapter_id: chapter._id,
    price: chapter.price
  });

  res.json({ message: "Mở khóa chương thành công!", coins: user.coins });
});

const reorderPages = asyncHandler(async (req, res) => {
  if (!req.user || (req.user.role !== 'creator' && req.user.role !== 'admin')) {
    throw new AppError("Bạn không có quyền chỉnh sửa chương.", 403);
  }
  const { order } = req.body;
  if (!order || !Array.isArray(order)) {
    throw new AppError("Cần gửi mảng order: [{ pageId, page_number }]", 400);
  }

  const chapter = await Chapter.findById(req.params.chapterId);
  if (!chapter) throw new AppError("Chapter không tồn tại", 404);

  const bulkOps = order.map(({ pageId, page_number }) => ({
    updateOne: {
      filter: { _id: pageId, chapter_id: chapter._id },
      update: { $set: { page_number } },
    },
  }));

  await Pages.bulkWrite(bulkOps);
  res.json({ message: "Đã cập nhật thứ tự trang thành công" });
});

const createChapter = asyncHandler(async (req, res) => {
  if (!req.user || (req.user.role !== 'creator' && req.user.role !== 'admin')) {
    throw new AppError("Bạn không có quyền tạo chương mới.", 403);
  }
  const newChapter = new Chapter(req.body);
  await newChapter.save();
  res.status(201).json(newChapter);
});

const deleteChapter = asyncHandler(async (req, res) => {
  if (!req.user || (req.user.role !== 'creator' && req.user.role !== 'admin')) {
    throw new AppError("Bạn không có quyền xóa chương.", 403);
  }
  const chapterId = req.params.id;
  const chapter = await Chapter.findByIdAndDelete(chapterId);
  if (!chapter) throw new AppError("Chapter not found", 404);

  const pages = await Pages.find({ chapter_id: chapterId });
  const r2Pages = pages.filter(p => p.image_url && p.image_url.startsWith('r2:'));
  await Promise.all(r2Pages.map(p => deleteFromR2(p.image_url)));

  await Pages.deleteMany({ chapter_id: chapterId });
  await Upload.deleteMany({ chapter_id: chapterId });

  res.json({ message: "Chapter and its pages deleted" });
});

const bulkDeleteChapters = asyncHandler(async (req, res) => {
  if (!req.user || (req.user.role !== 'creator' && req.user.role !== 'admin')) {
    throw new AppError("Bạn không có quyền xóa nhiều chương.", 403);
  }
  const { chapterIds } = req.body;
  if (!chapterIds || !Array.isArray(chapterIds)) {
    throw new AppError('Invalid payload: chapterIds must be an array', 400);
  }

  const pages = await Pages.find({ chapter_id: { $in: chapterIds } });
  const r2Pages = pages.filter(p => p.image_url && p.image_url.startsWith('r2:'));
  await Promise.all(r2Pages.map(p => deleteFromR2(p.image_url)));

  await Pages.deleteMany({ chapter_id: { $in: chapterIds } });
  await Upload.deleteMany({ chapter_id: { $in: chapterIds } });
  const result = await Chapter.deleteMany({ _id: { $in: chapterIds } });
  
  res.json({ message: 'Chapters and their pages deleted', count: result.deletedCount });
});

const deletePage = asyncHandler(async (req, res) => {
  if (!req.user || (req.user.role !== 'creator' && req.user.role !== 'admin')) {
    throw new AppError("Bạn không có quyền xóa trang truyện.", 403);
  }
  const { chapterId, pageId } = req.params;
  const page = await Pages.findOne({ _id: pageId, chapter_id: chapterId });
  if (!page) throw new AppError("Page not found", 404);

  if (page.image_url && page.image_url.startsWith('r2:')) {
    await deleteFromR2(page.image_url);
  }

  await Upload.deleteMany({ key: page.image_url });
  await Pages.findByIdAndDelete(pageId);

  await Pages.updateMany(
    { chapter_id: chapterId, page_number: { $gt: page.page_number } },
    { $inc: { page_number: -1 } }
  );

  res.json({ message: "Page deleted successfully" });
});

module.exports = {
  getChapterPages,
  unlockChapter,
  reorderPages,
  createChapter,
  deleteChapter,
  bulkDeleteChapters,
  deletePage
};
