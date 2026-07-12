import { randomUUID } from "crypto";
import { Comic, Chapter, Upload, Pages, User, mongoose } from "../database";
import { R2_ENABLED, deleteFromR2, getFileUrl, uploadToR2, resolveR2Url } from "../config/r2";
import asyncHandler from "../middleware/asyncHandler";
import AppError from "../utils/AppError";
import { convertToWebp } from "../utils/imageHelper";
import { findComicById } from "../utils/helpers";
import { canManageComic, isAdmin } from "../utils/accessControl";

const requireComicManager = (req, comic) => {
  if (!canManageComic(req.user, comic.uploader_id)) {
    throw new AppError("Bạn không có quyền chỉnh sửa truyện này.", 403);
  }
};

const getR2Status = (req, res) => {
  res.json({
    connected: R2_ENABLED,
    message: R2_ENABLED ? "R2 đã kết nối" : "R2 chưa cấu hình",
  });
};

const getSignedUrl = asyncHandler(async (req, res) => {
  if (!req.user || (req.user.role !== "admin" && req.user.role !== "creator")) {
    throw new AppError("Bạn không có quyền lấy signed URL trực tiếp.", 403);
  }

  const key = typeof req.query.key === "string" ? req.query.key : undefined;
  if (!key) throw new AppError("Thiếu query key", 400);

  if (!isAdmin(req.user)) {
    const upload = await Upload.findOne({ key }).select("comic_id").lean();
    const comic = upload?.comic_id
      ? await Comic.findById(upload.comic_id).select("uploader_id").lean()
      : null;
    if (!comic || !canManageComic(req.user, comic.uploader_id)) {
      throw new AppError("Bạn không có quyền truy cập tài nguyên này.", 403);
    }
  }

  const url = await getFileUrl(key, 3600);
  if (!url) throw new AppError("Không tìm thấy hoặc R2 chưa cấu hình", 404);
  res.json({ url });
});

const uploadCover = asyncHandler(async (req, res) => {
  if (!R2_ENABLED) throw new AppError("R2 chưa được cấu hình", 503);
  const comicId = req.params.comicId;
  const comic = await findComicById(comicId, "", false);
  if (!comic) throw new AppError("Comic không tồn tại", 404);
  requireComicManager(req, comic);
  if (!req.file) throw new AppError("Cần gửi file ảnh (field: cover)", 400);

  const webpBuffer = await convertToWebp(req.file.buffer);
  const key = `covers/${comicId}/${randomUUID()}.webp`;
  const { key: r2Key } = await uploadToR2(key, webpBuffer, "image/webp");
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

  const comic = await Comic.findById(chapter.comic_id).select("uploader_id");
  if (!comic) throw new AppError("Comic không tồn tại", 404);
  requireComicManager(req, comic);
  if (!req.files?.length) throw new AppError("Cần gửi ít nhất một ảnh (field: pages)", 400);

  const uploadResults = await Promise.allSettled(req.files.map(async (file, index) => {
    const webpBuffer = await convertToWebp(file.buffer);
    const key = `chapters/${chapterId}/${randomUUID()}.webp`;
    const { key: r2Key } = await uploadToR2(key, webpBuffer, "image/webp");
    return { index, r2Key };
  }));

  const uploadedData = uploadResults
    .filter((result): result is PromiseFulfilledResult<{ index: number; r2Key: string }> => result.status === "fulfilled")
    .map((result) => result.value)
    .sort((a, b) => a.index - b.index);
  const uploadFailure = uploadResults.find((result) => result.status === "rejected");

  if (uploadFailure) {
    await Promise.allSettled(uploadedData.map(({ r2Key }) => deleteFromR2(r2Key)));
    throw uploadFailure.reason;
  }

  const session = await mongoose.startSession();
  try {
    let createdPages: any[] = [];

    await session.withTransaction(async () => {
      const lastPage = await Pages.findOne({ chapter_id: chapter._id })
        .sort({ page_number: -1 })
        .session(session);
      const firstPageNumber = (lastPage?.page_number || 0) + 1;
      const pageDocuments = uploadedData.map(({ r2Key }, index) => ({
        chapter_id: chapter._id,
        page_number: firstPageNumber + index,
        image_url: r2Key,
      }));

      createdPages = await Pages.insertMany(pageDocuments, { session });
      await Upload.insertMany(createdPages.map((page) => ({
        key: page.image_url,
        type: "page",
        comic_id: chapter.comic_id,
        chapter_id: chapter._id,
        page_number: page.page_number,
      })), { session });
    });

    res.status(201).json({ chapter: chapterId, pages: createdPages });
  } catch (error) {
    await Promise.allSettled(uploadedData.map(({ r2Key }) => deleteFromR2(r2Key)));
    throw error;
  } finally {
    await session.endSession();
  }
});

const uploadAvatar = asyncHandler(async (req, res) => {
  if (!R2_ENABLED) throw new AppError("R2 chưa được cấu hình", 503);
  const user = await User.findById(req.user.id);
  if (!user) throw new AppError("User không tồn tại", 404);
  if (!req.file) throw new AppError("Cần gửi file ảnh (field: avatar)", 400);

  const webpBuffer = await convertToWebp(req.file.buffer);
  const key = `avatars/${user._id}/${randomUUID()}.webp`;
  const { key: r2Key } = await uploadToR2(key, webpBuffer, "image/webp");
  user.avatar_url = r2Key;
  await user.save();

  const safeUser = user.toObject() as any;
  delete safeUser.password;
  if (safeUser.avatar_url) safeUser.avatar_url = await resolveR2Url(safeUser.avatar_url);

  res.status(201).json({ user: safeUser, avatar_url: safeUser.avatar_url });
});

export { getR2Status, getSignedUrl, uploadCover, uploadChapterPages, uploadAvatar };
