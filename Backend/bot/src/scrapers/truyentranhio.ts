import type { ComicMeta, ChapterMeta, Scraper } from './types.js';
import { openPage, sleep } from './browser.js';

export class TruyenTranhIOScraper implements Scraper {
  name = 'truyentranh.io';

  canHandle(url: string): boolean {
    return /truyentranh\.io/i.test(url);
  }

  async scrapeMeta(url: string): Promise<ComicMeta> {
    const page = await openPage();
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      await sleep(2000);

      return await page.evaluate(() => {
        const title = document.querySelector('h1')?.textContent?.trim() || 'Untitled';
        const author = document.querySelector('a[href*="tac-gia"]')?.textContent?.trim() || 'Unknown';

        const metaDesc = document.querySelector('meta[name="description"]');
        const description = metaDesc?.getAttribute('content')?.trim()
          || document.querySelector('.description, [itemprop="description"]')?.textContent?.trim()
          || '';

        let coverUrl = '';
        const ogImage = document.querySelector('meta[property="og:image"]');
        if (ogImage) {
          coverUrl = ogImage.getAttribute('content') || '';
          if (coverUrl && !coverUrl.startsWith('http')) {
            coverUrl = 'https://truyentranh.io' + coverUrl;
          }
        }

        const genreLinks = document.querySelectorAll('a[href*="truyen-"]');
        const genres = [...new Set(
          Array.from(genreLinks)
            .map(a => a.textContent?.trim() || '')
            .filter(t => t && t.length < 30 && !t.includes('truyen'))
        )];

        const text = document.body?.textContent || '';
        let status: 'Ongoing' | 'Completed' | 'Hiatus' = 'Ongoing';
        if (/hoàn thành|completed/i.test(text)) status = 'Completed';
        else if (/tạm ngưng|hiatus/i.test(text)) status = 'Hiatus';

        return { title, author, description, coverUrl, genres, status, sourceUrl: document.URL };
      });
    } finally {
      await page.close();
    }
  }

  async scrapeChapterList(url: string): Promise<ChapterMeta[]> {
    const page = await openPage();
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      await sleep(2000);

      const totalPages = await page.evaluate(() => {
        const btns = document.querySelectorAll('.eTruyen-paging');
        let max = 0;
        btns.forEach(b => {
          const n = parseInt(b.textContent?.trim() || '0', 10);
          if (n > max) max = n;
        });
        return max;
      });

      const base = url.replace(/\/?$/, '');
      const allChapters: ChapterMeta[] = [];

      for (let p = 1; p <= (totalPages || 1); p++) {
        if (p > 1) {
          await page.goto(`${base}/trang-${p}/`, { waitUntil: 'networkidle2', timeout: 30000 });
          await sleep(1500);
        }

        const pageChapters = await page.evaluate(() => {
          const links: ChapterMeta[] = [];
          const seen = new Set<string>();

          document.querySelectorAll('a[href*="chuong-"]').forEach((el) => {
            const href = (el as HTMLAnchorElement).href;
            const text = el.textContent?.trim() || '';
            if (!href || seen.has(href)) return;
            seen.add(href);

            const num = text.match(/[\d.]+/)?.[0];
            const chapterNumber = num ? parseFloat(num) : links.length + 1;
            const title = text.replace(/chương\s*[\d.]+\s*/i, '').trim();

            links.push({ chapterNumber, title: title || `Chương ${chapterNumber}`, url: href });
          });

          return links;
        });

        allChapters.push(...pageChapters);
      }

      allChapters.sort((a, b) => a.chapterNumber - b.chapterNumber);
      return allChapters;
    } finally {
      await page.close();
    }
  }

  async scrapeChapterImages(url: string): Promise<string[]> {
    const page = await openPage();
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      await sleep(3000);

      return await page.evaluate(() => {
        const imgs: string[] = [];
        document.querySelectorAll('img[src*="comiccdn"], .chapter-content img, #chapter-content img, .reading-content img, img[src*=".jpg"], img[src*=".png"], img[src*=".webp"]')
          .forEach((img) => {
            const src = (img as HTMLImageElement).src
              || img.getAttribute('data-src')
              || img.getAttribute('data-original')
              || img.getAttribute('data-lazy-src');
            if (src
              && src.startsWith('http')
              && !src.includes('logo')
              && !src.includes('banner')
              && !imgs.includes(src)) {
              imgs.push(src);
            }
          });
        return imgs;
      });
    } finally {
      await page.close();
    }
  }
}
