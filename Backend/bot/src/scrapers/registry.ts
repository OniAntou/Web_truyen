import type { Scraper, ComicMeta, ChapterMeta } from './types.js';
import { MangapillScraper } from './mangapill.js';
import { BlogTruyenScraper } from './blogtruyen.js';
import { TruyenTranhIOScraper } from './truyentranhio.js';
import { PuppeteerScraper } from './puppeteer.js';

const scrapers: Scraper[] = [
  new BlogTruyenScraper(),
  new TruyenTranhIOScraper(),
];

export function findScraper(url: string): Scraper | null {
  for (const s of scrapers) {
    if (s.canHandle(url)) return s;
  }
  const fallback = scrapers.find(s => s.name === 'puppeteer-generic');
  return fallback || null;
}

export async function scrapeMeta(url: string): Promise<ComicMeta> {
  const scraper = findScraper(url);
  if (!scraper) throw new Error(`Không tìm thấy scraper cho: ${url}`);
  console.log(`[Scraper] Dùng "${scraper.name}" để lấy metadata`);
  return scraper.scrapeMeta(url);
}

export async function scrapeChapterList(url: string): Promise<ChapterMeta[]> {
  const scraper = findScraper(url);
  if (!scraper) throw new Error(`Không tìm thấy scraper cho: ${url}`);
  return scraper.scrapeChapterList(url);
}

export async function scrapeChapterImages(url: string): Promise<string[]> {
  const scraper = findScraper(url);
  if (!scraper) throw new Error(`Không tìm thấy scraper cho: ${url}`);
  return scraper.scrapeChapterImages(url);
}
