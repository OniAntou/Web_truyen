import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

export const config = {
  api: {
    baseUrl: process.env.API_URL || 'http://localhost:5000/api',
    email: process.env.AUTH_EMAIL || '',
    password: process.env.AUTH_PASSWORD || '',
  },
  bot: {
    downloadDir: path.resolve(process.env.DOWNLOAD_DIR || path.resolve(__dirname, '..', 'downloads')),
    concurrency: parseInt(process.env.CONCURRENCY || '3', 10),
    delayMs: parseInt(process.env.DELAY_MS || '1000', 10),
    maxChapters: parseInt(process.env.MAX_CHAPTERS || '0', 10),
    scrapeImages: process.env.SCRAPE_IMAGES !== 'false',
  },
  proxy: process.env.PROXY_URL || undefined,
};
