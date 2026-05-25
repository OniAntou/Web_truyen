import {  Comic, Chapter, Upload, Pages, User  } from "../database";
import {  R2_ENABLED, getFileUrl, uploadToR2, resolveR2Url  } from "../config/r2";
import asyncHandler from "../middleware/asyncHandler";
import AppError from "../utils/AppError";
import {  convertToWebp  } from "../utils/imageHelper";
import {  findComicById  } from "../utils/helpers";

const getR2Status = (req, res) => {
  res.json({
    connected: R2_ENABLED,
    message: R2_ENABLED ? "R2 đã kết nối" : "R2 chưa cấu hình",
  });
};

const getSignedUrl = asyncHandler(async (req, res) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'creator')) {
    throw new AppError("Bạn không có quyền lấy signed URL trực tiếp.", 403);
  }
  const key = req.query.key;
  if (!key) throw new AppError("Thiếu query key", 400);
  const url = await getFileUrl(key, 3600);
  if (!url) throw new AppError("Không tìm thấy hoặc R2 chưa cấu hình", 404);
  res.json({ url });
});

const uploadCover = asyncHandler(async (req, res) => {
  if (!R2_ENABLED) throw new AppError("R2 chưa được cấu hình", 503);
  const comicId = req.params.comicId;
  const comic = await findComicById(comicId, '', false);
  if (!comic) throw new AppError("Comic không tồn tại", 404);
  if (!req.file) throw new AppError("Cần gửi file ảnh (field: cover)", 400);

  // Convert to WebP
  const webpBuffer = await convertToWebp(req.file.buffer);
  const key = `covers/${comicId}/${Date.now()}.webp`;

  const { key: r2Key } = await uploadToR2(
    key,
    webpBuffer,
    "image/webp",
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
  const existingPages = await Pages.find({ chapter_id: chapter._id }).sort('-page_number');
  const maxPageNumber = existingPages.length > 0 ? existingPages[0].page_number : 0;

  // Upload all files to R2 in parallel
  const uploadPromises = req.files.map(async (f, i) => {
    const pageNum = maxPageNumber + i + 1;
    
    // Convert to WebP
    const webpBuffer = await convertToWebp(f.buffer);
    const key = `chapters/${chapterId}/${pageNum}-${Date.now()}.webp`;

    const { key: r2Key } = await uploadToR2(key, webpBuffer, "image/webp");
    return {
      r2Key,
      pageNum,
    };
  });

  const uploadedData = await Promise.all(uploadPromises);

  // Create database records for all uploaded pages in parallel
  const pagePromises = uploadedData.map(({ r2Key, pageNum }) =>
    Pages.create({
      chapter_id: chapter._id,
      page_number: pageNum,
      image_url: r2Key,
    }).then((page) =>
      Upload.create({
        key: r2Key,
        type: "page",
        comic_id: comicId,
        chapter_id: chapter._id,
        page_number: pageNum,
      }).then(() => page)
    )
  );

  const created = await Promise.all(pagePromises);
  res.status(201).json({ chapter: chapterId, pages: created });
});

const uploadAvatar = asyncHandler(async (req, res) => {
  if (!R2_ENABLED) throw new AppError("R2 chưa được cấu hình", 503);
  const user = await User.findById(req.user.id);
  if (!user) throw new AppError("User không tồn tại", 404);
  if (!req.file) throw new AppError("Cần gửi file ảnh (field: avatar)", 400);

  // Convert to WebP
  const webpBuffer = await convertToWebp(req.file.buffer);
  const key = `avatars/${user._id}/${Date.now()}.webp`;

  const { key: r2Key } = await uploadToR2(
    key,
    webpBuffer,
    "image/webp",
  );
  
  user.avatar_url = r2Key;
  await user.save();
  
  const safeUser = user.toObject() as any;
  delete safeUser.password;
  
  if (safeUser.avatar_url) {
    safeUser.avatar_url = await resolveR2Url(safeUser.avatar_url);
  }
  
  res.status(201).json({ user: safeUser, avatar_url: safeUser.avatar_url });
});

export { 
  getR2Status,
  getSignedUrl,
  uploadCover,
  uploadChapterPages,
  uploadAvatar
 };
