const { Comic, Chapter, Upload, Pages } = require('../../Database/database');
const { R2_ENABLED, getFileUrl, uploadToR2 } = require('../config/r2');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');

const getR2Status = (req, res) => {
  res.json({
    connected: R2_ENABLED,
    message: R2_ENABLED ? "R2 đã kết nối" : "R2 chưa cấu hình",
  });
};

const getSignedUrl = asyncHandler(async (req, res) => {
  const key = req.query.key;
  if (!key) throw new AppError("Thiếu query key", 400);
  const url = await getFileUrl(key, 3600);
  if (!url) throw new AppError("Không tìm thấy hoặc R2 chưa cấu hình", 404);
  res.json({ url });
});

const uploadCover = asyncHandler(async (req, res) => {
  if (!R2_ENABLED) throw new AppError("R2 chưa được cấu hình", 503);
  const comicId = req.params.comicId;
  let comic;
  if (comicId.match(/^[0-9a-fA-F]{24}$/)) {
    comic = await Comic.findById(comicId);
  } else {
    comic = await Comic.findOne({ id: parseInt(comicId) });
  }
  if (!comic) throw new AppError("Comic không tồn tại", 404);
  if (!req.file) throw new AppError("Cần gửi file ảnh (field: cover)", 400);
  const ext = (req.file.originalname || "").split(".").pop() || "jpg";
  const key = `covers/${comicId}/${Date.now()}.${ext}`;
  const { key: r2Key } = await uploadToR2(
    key,
    req.file.buffer,
    req.file.mimetype,
  );
  await Upload.create({ key: r2Key, type: "cover", comic_id: comic._id });
  comic.cover_url = r2Key;
  await comic.save();
  res.status(201).json({ comic, cover_url: r2Key });
});

const uploadChapterPages = asyncHandler(async (req, res) => {
  if (!R2_ENABLED) throw new AppError("R2 chưa được cấu hình", 503);
  const chapterId = req.params.chapterId;
  const chapter = await Chapter.findById(chapterId);
  if (!chapter) throw new AppError("Chapter không tồn tại", 404);
  const comicId = chapter.comic_id;
  if (!req.files?.length) throw new AppError("Cần gửi ít nhất một ảnh (field: pages)", 400);
  const created = [];
  const existingPages = await Pages.find({ chapter_id: chapter._id }).sort('-page_number');
  const maxPageNumber = existingPages.length > 0 ? existingPages[0].page_number : 0;

  for (let i = 0; i < req.files.length; i++) {
    const f = req.files[i];
    const pageNum = maxPageNumber + i + 1;
    const ext = (f.originalname || "").split(".").pop() || "jpg";
    const key = `chapters/${chapterId}/${pageNum}-${Date.now()}.${ext}`;
    const { key: r2Key } = await uploadToR2(key, f.buffer, f.mimetype);
    await Upload.create({
      key: r2Key,
      type: "page",
      comic_id: comicId,
      chapter_id: chapter._id,
      page_number: pageNum,
    });
    const page = await Pages.create({
      chapter_id: chapter._id,
      page_number: pageNum,
      image_url: r2Key,
    });
    created.push(page);
  }
  res.status(201).json({ chapter: chapterId, pages: created });
});

module.exports = {
  getR2Status,
  getSignedUrl,
  uploadCover,
  uploadChapterPages
};
