const { Comic, Chapter, Upload, Pages } = require('../../Database/database');
const { R2_ENABLED, getFileUrl, uploadToR2 } = require('../config/r2');

const getR2Status = (req, res) => {
  res.json({
    connected: R2_ENABLED,
    message: R2_ENABLED ? "R2 đã kết nối" : "R2 chưa cấu hình",
  });
};

const getSignedUrl = async (req, res) => {
  try {
    const key = req.query.key;
    if (!key) return res.status(400).json({ message: "Thiếu query key" });
    const url = await getFileUrl(key, 3600);
    if (!url)
      return res
        .status(404)
        .json({ message: "Không tìm thấy hoặc R2 chưa cấu hình" });
    res.json({ url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const uploadCover = async (req, res) => {
  try {
    if (!R2_ENABLED)
      return res.status(503).json({ message: "R2 chưa được cấu hình" });
    const comicId = req.params.comicId;
    let comic;
    if (comicId.match(/^[0-9a-fA-F]{24}$/)) {
      comic = await Comic.findById(comicId);
    } else {
      comic = await Comic.findOne({ id: parseInt(comicId) });
    }
    if (!comic)
      return res.status(404).json({ message: "Comic không tồn tại" });
    if (!req.file)
      return res
        .status(400)
        .json({ message: "Cần gửi file ảnh (field: cover)" });
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
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const uploadChapterPages = async (req, res) => {
  try {
    if (!R2_ENABLED)
      return res.status(503).json({ message: "R2 chưa được cấu hình" });
    const chapterId = req.params.chapterId;
    const chapter = await Chapter.findById(chapterId);
    if (!chapter)
      return res.status(404).json({ message: "Chapter không tồn tại" });
    const comicId = chapter.comic_id;
    if (!req.files?.length)
      return res
        .status(400)
        .json({ message: "Cần gửi ít nhất một ảnh (field: pages)" });
    const created = [];
    for (let i = 0; i < req.files.length; i++) {
      const f = req.files[i];
      const ext = (f.originalname || "").split(".").pop() || "jpg";
      const key = `chapters/${chapterId}/${i + 1}.${ext}`;
      const { key: r2Key } = await uploadToR2(key, f.buffer, f.mimetype);
      await Upload.create({
        key: r2Key,
        type: "page",
        comic_id: comicId,
        chapter_id: chapter._id,
        page_number: i + 1,
      });
      const page = await Pages.create({
        chapter_id: chapter._id,
        page_number: i + 1,
        image_url: r2Key,
      });
      created.push(page);
    }
    res.status(201).json({ chapter: chapterId, pages: created });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  getR2Status,
  getSignedUrl,
  uploadCover,
  uploadChapterPages
};
