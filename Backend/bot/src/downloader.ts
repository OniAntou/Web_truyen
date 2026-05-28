import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { createWriteStream } from 'fs';
import { Readable } from 'stream';
import { finished } from 'stream/promises';
import { config } from './config.js';

export async function downloadImage(url: string, destPath: string, referer?: string): Promise<string> {
  await fs.mkdir(path.dirname(destPath), { recursive: true });

  const response = await axios({
    method: 'GET',
    url,
    responseType: 'stream',
    timeout: 60000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      'Referer': referer || 'https://mangapill.com/',
      'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Sec-Fetch-Dest': 'image',
      'Sec-Fetch-Mode': 'no-cors',
      'Sec-Fetch-Site': 'cross-site',
    },
  });

  const writer = createWriteStream(destPath);
  response.data.pipe(writer);
  await finished(writer);

  return destPath;
}

export async function downloadChapterImages(
  chapterDir: string,
  imageUrls: string[],
  concurrency: number = config.bot.concurrency,
): Promise<string[]> {
  await fs.mkdir(chapterDir, { recursive: true });

  const paths: string[] = [];
  const queue = [...imageUrls];

  const worker = async () => {
    while (queue.length > 0) {
      const url = queue.shift()!;
      const ext = path.extname(new URL(url).pathname).split('?')[0] || '.jpg';
      const filename = `${paths.length + 1}${ext}`;
      const dest = path.join(chapterDir, filename);

      try {
        await downloadImage(url, dest);
        paths.push(dest);
        process.stdout.write('.');
      } catch (err: any) {
        console.error(`\n[Downloader] Lỗi tải ảnh: ${url} - ${err.message}`);
      }
    }
  };

  const workers = Array.from({ length: Math.min(concurrency, imageUrls.length) }, worker);
  await Promise.all(workers);

  return paths;
}

export function cleanupDir(dir: string): Promise<void> {
  return fs.rm(dir, { recursive: true, force: true });
}
