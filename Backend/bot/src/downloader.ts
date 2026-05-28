import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { createWriteStream } from 'fs';
import { Readable } from 'stream';
import { finished } from 'stream/promises';
import { config } from './config.js';

export async function downloadImage(url: string, destPath: string, referer?: string, retries = 3): Promise<string> {
  await fs.mkdir(path.dirname(destPath), { recursive: true });

  let proxyConfig: any = false;
  if (config.proxy) {
    try {
      const pUrl = new URL(config.proxy);
      proxyConfig = {
        protocol: pUrl.protocol.replace(':', ''),
        host: pUrl.hostname,
        port: parseInt(pUrl.port, 10),
      };
      if (pUrl.username) {
        proxyConfig.auth = { username: decodeURIComponent(pUrl.username), password: decodeURIComponent(pUrl.password) };
      }
    } catch (e) {}
  }

  let attempt = 0;
  while (attempt < retries) {
    try {
      const response = await axios({
        method: 'GET',
        url,
        responseType: 'stream',
        timeout: 60000,
        proxy: proxyConfig,
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

      const contentLength = parseInt(String(response.headers['content-length'] || '0'), 10);
      const writer = createWriteStream(destPath);
      response.data.pipe(writer);
      await finished(writer);

      const stat = await fs.stat(destPath);
      console.log(`\n[Download] ${path.basename(destPath)}: expected ${contentLength}, got ${stat.size}`);

      if (contentLength > 0 && stat.size !== contentLength) {
        throw new Error(`File size mismatch: expected ${contentLength}, got ${stat.size}`);
      }

      // VipsJpeg might still fail if there is no contentLength and it was chunked.
      // We could use an image library to verify it, but for now we'll rely on the backend.
      
      return destPath;
    } catch (err: any) {
      attempt++;
      if (attempt >= retries) {
        throw new Error(`Tải ảnh thất bại sau ${retries} lần: ${err.message}`);
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  return destPath;
}

export async function downloadChapterImages(
  chapterDir: string,
  imageUrls: string[],
  concurrency: number = config.bot.concurrency,
): Promise<string[]> {
  await fs.mkdir(chapterDir, { recursive: true });

  const paths: string[] = new Array(imageUrls.length);
  const queue = imageUrls.map((url, index) => ({ url, index }));

  const worker = async () => {
    while (queue.length > 0) {
      const { url, index } = queue.shift()!;
      const ext = path.extname(new URL(url).pathname).split('?')[0] || '.jpg';
      const filename = `${index + 1}${ext}`;
      const dest = path.join(chapterDir, filename);

      try {
        await downloadImage(url, dest);
        paths[index] = dest;
        process.stdout.write('.');
      } catch (err: any) {
        console.error(`\n[Downloader] Lỗi tải ảnh: ${url} - ${err.message}`);
      }
    }
  };

  const workers = Array.from({ length: Math.min(concurrency, imageUrls.length) }, worker);
  await Promise.all(workers);

  return paths.filter(p => p !== undefined);
}

export function cleanupDir(dir: string): Promise<void> {
  return fs.rm(dir, { recursive: true, force: true });
}
