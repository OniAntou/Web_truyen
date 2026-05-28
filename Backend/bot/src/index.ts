import path from 'path';
import fs from 'fs/promises';
import { config } from './config.js';
import { ApiClient } from './apiClient.js';
import { findScraper, scrapeMeta, scrapeChapterList, scrapeChapterImages } from './scrapers/registry.js';
import { downloadChapterImages, cleanupDir } from './downloader.js';
import { sleep } from './utils.js';

async function main() {
  const args = process.argv.slice(2);
  const url = args[0];

  if (!url || args.includes('--help')) {
    console.log(`
╔══════════════════════════════════════════════════╗
║         ComicVerse Bot - Cào truyện             ║
╚══════════════════════════════════════════════════╝

Sử dụng:  tsx src/index.ts <url> [options]

Options:
  --email <email>          Email đăng nhập (ghi đè .env)
  --password <password>    Mật khẩu (ghi đè .env)
  --max-chapters <n>       Chỉ cào n chapter đầu
  --concurrency <n>        Số luồng tải ảnh song song
  --delay <ms>             Delay giữa các chapter (ms)
  --no-images              Không tải ảnh (chỉ lấy metadata)
  --help                   Hiển thị help này

Ví dụ:
  tsx src/index.ts https://mangapill.com/manga/2/one-piece
  tsx src/index.ts https://mangapill.com/manga/2/one-piece --max-chapters 5 --concurrency 2
    `.trim());
    process.exit(0);
  }

  const email = getArg(args, '--email') || config.api.email;
  const password = getArg(args, '--password') || config.api.password;
  const maxChapters = parseInt(getArg(args, '--max-chapters') || String(config.bot.maxChapters), 10);
  const concurrency = parseInt(getArg(args, '--concurrency') || String(config.bot.concurrency), 10);
  const delayMs = parseInt(getArg(args, '--delay') || String(config.bot.delayMs), 10);
  const scrapeImages = !args.includes('--no-images') && config.bot.scrapeImages;

  if (!email || !password) {
    console.error('Lỗi: Vui lòng cấu hình email/password trong .env hoặc truyền qua --email --password');
    process.exit(1);
  }

  const scraper = findScraper(url);
  if (!scraper) {
    console.error(`Không tìm thấy scraper cho URL: ${url}`);
    process.exit(1);
  }

  const api = new ApiClient();
  await api.login(email, password);

  console.log(`\n[Bot] Bắt đầu xử lý: ${url}`);
  console.log(`[Bot] Scraper: ${scraper.name}`);
  console.log(`[Bot] Max chapters: ${maxChapters || 'Tất cả'}`);
  console.log(`[Bot] Download ảnh: ${scrapeImages ? 'Có' : 'Không'}`);
  console.log('');

  console.log(`[Bot] Đang lấy thông tin truyện...`);
  const comic = await scrapeMeta(url);

  console.log(`[Bot] Đang lấy danh sách chapter...`);
  let chapters = await scrapeChapterList(url);
  chapters = maxChapters > 0 ? chapters.slice(0, maxChapters) : chapters;

  console.log(`\n[Bot] Truyện: ${comic.title}`);
  console.log(`[Bot] Tác giả: ${comic.author}`);
  console.log(`[Bot] Thể loại: ${comic.genres.join(', ')}`);
  console.log(`[Bot] Số chapter sẽ đăng: ${chapters.length}`);
  console.log('');

  if (scrapeImages && comic.coverUrl) {
    console.log(`[Bot] Đang tải ảnh bìa...`);
  }

  const newComic = await api.createComic({
    title: comic.title,
    author: comic.author,
    artist: comic.artist || comic.author,
    status: comic.status,
    description: comic.description,
    genres: comic.genres,
  });

  if (scrapeImages && comic.coverUrl) {
    try {
      const coverDir = path.join(config.bot.downloadDir, 'covers', newComic._id);
      await fs.mkdir(coverDir, { recursive: true });
      const coverExt = path.extname(new URL(comic.coverUrl).pathname).split('?')[0] || '.jpg';
      const coverPath = path.join(coverDir, `cover${coverExt}`);

      const { downloadImage } = await import('./downloader.js');
      await downloadImage(comic.coverUrl, coverPath);
      await api.uploadCover(newComic._id, coverPath);
    } catch (err: any) {
      console.error(`[Bot] Lỗi upload ảnh bìa: ${err.message}`);
    }
  }

  for (let i = 0; i < chapters.length; i++) {
    const ch = chapters[i];
    console.log(`\n[Bot] Chapter ${ch.chapterNumber}: "${ch.title}" (${i + 1}/${chapters.length})`);

    const newChapter = await api.createChapter({
      comic_id: newComic._id,
      chapter_number: ch.chapterNumber,
      title: ch.title,
    });

    if (scrapeImages) {
      console.log(`[Bot]   Đang lấy danh sách ảnh...`);
      const imageUrls = await scrapeChapterImages(ch.url);
      console.log(`[Bot]   Tìm thấy ${imageUrls.length} ảnh`);

      if (imageUrls.length > 0) {
        console.log(`[Bot]   Đang tải ảnh...`);
        const chapterDir = path.join(config.bot.downloadDir, 'chapters', newComic._id, String(ch.chapterNumber));

        const pagePaths = await downloadChapterImages(chapterDir, imageUrls, concurrency);
        console.log(`\n[Bot]   Upload ${pagePaths.length} ảnh...`);
        try {
          await api.uploadChapterPages(newChapter._id, pagePaths);
        } catch (err: any) {
          console.error(`\n[Bot]   Lỗi upload ảnh: ${err.message}`);
        }

        await cleanupDir(chapterDir);
      }
    }

    if (i < chapters.length - 1 && delayMs > 0) {
      await sleep(delayMs);
    }
  }

  console.log(`\n[Bot] Hoàn thành! Đã đăng ${chapters.length} chapter của "${comic.title}".`);
}

function getArg(args: string[], name: string): string | undefined {
  const idx = args.indexOf(name);
  if (idx !== -1 && idx + 1 < args.length) {
    return args[idx + 1];
  }
  return undefined;
}

main().catch((err) => {
  console.error('\n[Bot] LỖI:', err.message);
  process.exit(1);
});
