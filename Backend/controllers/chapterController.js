const { Chapter, Pages, Upload } = require('../../Database/database');
const { resolveR2Url, deleteFromR2 } = require('../config/r2');

const getChapterPages = async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.chapterId);
    if (!chapter) return res.status(404).json({ message: "Chapter không tồn tại" });

    const pages = await Pages.find({ chapter_id: chapter._id }).sort({ page_number: 1 });
    const pagesWithUrls = await Promise.all(
      pages.map(async (p) => ({
        _id: p._id,
        page_number: p.page_number,
        image_url: (await resolveR2Url(p.image_url)) || p.image_url,
      }))
    );
    res.json(pagesWithUrls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const reorderPages = async (req, res) => {
  try {
    const { order } = req.body;
    if (!order || !Array.isArray(order)) {
      return res.status(400).json({ message: "Cần gửi mảng order: [{ pageId, page_number }]" });
    }

    const chapter = await Chapter.findById(req.params.chapterId);
    if (!chapter) return res.status(404).json({ message: "Chapter không tồn tại" });

    const bulkOps = order.map(({ pageId, page_number }) => ({
      updateOne: {
        filter: { _id: pageId, chapter_id: chapter._id },
        update: { $set: { page_number } },
      },
    }));

    await Pages.bulkWrite(bulkOps);
    res.json({ message: "Đã cập nhật thứ tự trang thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createChapter = async (req, res) => {
  try {
    const newChapter = new Chapter(req.body);
    await newChapter.save();
    res.status(201).json(newChapter);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteChapter = async (req, res) => {
  try {
    const chapterId = req.params.id;
    const chapter = await Chapter.findByIdAndDelete(chapterId);
    if (!chapter) return res.status(404).json({ message: "Chapter not found" });

    const pages = await Pages.find({ chapter_id: chapterId });
    const r2Pages = pages.filter(p => p.image_url && p.image_url.startsWith('r2:'));
    await Promise.all(r2Pages.map(p => deleteFromR2(p.image_url)));

    await Pages.deleteMany({ chapter_id: chapterId });
    await Upload.deleteMany({ chapter_id: chapterId });

    res.json({ message: "Chapter and its pages deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const bulkDeleteChapters = async (req, res) => {
  try {
    const { chapterIds } = req.body;
    if (!chapterIds || !Array.isArray(chapterIds)) {
      return res.status(400).json({ message: 'Invalid payload: chapterIds must be an array' });
    }

    const pages = await Pages.find({ chapter_id: { $in: chapterIds } });
    const r2Pages = pages.filter(p => p.image_url && p.image_url.startsWith('r2:'));
    await Promise.all(r2Pages.map(p => deleteFromR2(p.image_url)));

    await Pages.deleteMany({ chapter_id: { $in: chapterIds } });
    await Upload.deleteMany({ chapter_id: { $in: chapterIds } });
    const result = await Chapter.deleteMany({ _id: { $in: chapterIds } });
    
    res.json({ message: 'Chapters and their pages deleted', count: result.deletedCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deletePage = async (req, res) => {
  try {
    const { chapterId, pageId } = req.params;
    const page = await Pages.findOne({ _id: pageId, chapter_id: chapterId });
    if (!page) return res.status(404).json({ message: "Page not found" });

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
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getChapterPages,
  reorderPages,
  createChapter,
  deleteChapter,
  bulkDeleteChapters,
  deletePage
};
