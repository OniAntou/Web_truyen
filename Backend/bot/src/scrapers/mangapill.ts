import type { ComicMeta, ChapterMeta, Scraper } from './types.js';
import { openPage, sleep } from './browser.js';

export class MangapillScraper implements Scraper {
  name = 'mangapill';

  canHandle(url: string): boolean {
    return /mangapill\.com/i.test(url);
  }

  async scrapeMeta(url: string): Promise<ComicMeta> {
    const page = await openPage();
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

      return await page.evaluate(() => {
        const title = (document.querySelector('h1') as HTMLElement)?.textContent?.trim() || 'Untitled';

        const metaDesc = document.querySelector('meta[name="description"]');
        const description = metaDesc?.getAttribute('content')?.trim() || '';

        const ogImage = document.querySelector('meta[property="og:image"]');
        const coverUrl = ogImage?.getAttribute('content')?.trim() || '';

        const authorEl = document.querySelector('a[href*="author"]');
        const author = authorEl?.textContent?.trim() || 'Unknown';

        const genreNodes = document.querySelectorAll('a[href*="/genres/"]');
        const genres = [...new Set(
          Array.from(genreNodes).map(g => (g as HTMLElement).textContent?.trim() || '').filter(Boolean)
        )];

        const text = document.body.textContent || '';
        let status: 'Ongoing' | 'Completed' | 'Hiatus' = 'Ongoing';
        if (/completed/i.test(text)) status = 'Completed';
        else if (/hiatus/i.test(text)) status = 'Hiatus';

        return { title, description, coverUrl, author, genres, status, sourceUrl: document.URL };
      });
    } finally {
      await page.close();
    }
  }

  async scrapeChapterList(url: string): Promise<ChapterMeta[]> {
    const page = await openPage();
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

      return await page.evaluate(() => {
        const links: ChapterMeta[] = [];
        const seen = new Set<string>();

        document.querySelectorAll('a[href*="/chapters/"]').forEach((el) => {
          const href = (el as HTMLAnchorElement).href;
          const text = el.textContent?.trim() || '';
          if (!href || seen.has(href)) return;
          seen.add(href);

          const num = text.match(/[\d.]+/)?.[0];
          const chapterNumber = num ? parseFloat(num) : links.length + 1;
          const title = text.replace(/chapter\s*[\d.]+\s*/i, '').trim();

          links.push({ chapterNumber, title: title || `Chapter ${chapterNumber}`, url: href });
        });

        links.sort((a, b) => a.chapterNumber - b.chapterNumber);
        return links;
      });
    } finally {
      await page.close();
    }
  }

  async scrapeChapterImages(url: string): Promise<string[]> {
    const page = await openPage();
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
      await sleep(3000);

      return await page.evaluate(() => {
        const imgs: string[] = [];
        document.querySelectorAll('img[loading="lazy"], img[src*="chapter"], main img, .chapter-content img').forEach((img) => {
          const src = (img as HTMLImageElement).src
            || img.getAttribute('data-src')
            || img.getAttribute('data-original')
            || img.getAttribute('data-lazy-src');
          if (src && src.startsWith('http') && !imgs.includes(src)) {
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
