import type { ComicMeta, ChapterMeta, Scraper } from './types.js';
import { openPage, sleep } from './browser.js';

export class PuppeteerScraper implements Scraper {
  name = 'puppeteer-generic';

  canHandle(_url: string): boolean {
    return true;
  }

  async scrapeMeta(url: string): Promise<ComicMeta> {
    const page = await openPage();
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

      return await page.evaluate(() => {
        const title = (
          document.querySelector('h1[itemprop="name"]')
          || document.querySelector('.entry-title')
          || document.querySelector('h1')
          || document.querySelector('title')
        )?.textContent?.trim() || 'Untitled';

        const author = (
          document.querySelector('[itemprop="author"]')
          || document.querySelector('.author a')
          || document.querySelector('a[href*="tac-gia"]')
          || document.querySelector('a[href*="author"]')
        )?.textContent?.trim() || 'Unknown';

        const description = (
          document.querySelector('[itemprop="description"]')
          || document.querySelector('.description')
          || document.querySelector('.detail-content')
          || document.querySelector('.entry-content')
          || document.querySelector('meta[name="description"]')
        )?.getAttribute?.('content')?.trim()
          || document.querySelector('[itemprop="description"]')?.textContent?.trim()
          || '';

        const coverUrl = (
          (document.querySelector('meta[property="og:image"]') as HTMLMetaElement)?.content
          || (document.querySelector('.thumbnail img') as HTMLImageElement)?.src
          || (document.querySelector('.cover img') as HTMLImageElement)?.src
          || (document.querySelector('img[itemprop="image"]') as HTMLImageElement)?.src
          || ''
        );

        const allLis = Array.from(document.querySelectorAll('li, p, span'));
        const statusEl = allLis.find(el => /tình trạng|status/i.test(el.textContent || ''));
        const statusText = statusEl?.textContent || '';
        let status: 'Ongoing' | 'Completed' | 'Hiatus' = 'Ongoing';
        if (/hoàn thành|completed|full/i.test(statusText)) status = 'Completed';
        else if (/tạm ngưng|hiatus|dropped/i.test(statusText)) status = 'Hiatus';

        const genreNodes = document.querySelectorAll('a[href*="the-loai"], .category a, .genres a, [itemprop="genre"] a, a[href*="genre"]');
        const genres = [...new Set(
          Array.from(genreNodes).map(g => (g as HTMLElement).textContent?.trim() || '').filter(Boolean)
        )];

        return { title, author, description, coverUrl, status, genres, sourceUrl: document.URL };
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
        document.querySelectorAll('ul.list-chapters a, .chapter-list a, table td:first-child a, .listing a')
          .forEach((el) => {
            const href = (el as HTMLAnchorElement).href;
            const text = el.textContent?.trim() || '';
            if (!href || href === '#') return;

            const numMatch = text.match(/chapter\s*(\d+)/i) || text.match(/chương\s*(\d+)/i) || text.match(/(\d+)/);
            const chapterNumber = numMatch ? parseInt(numMatch[1], 10) : links.length + 1;
            const title = text.replace(/chapter\s*\d+/i, '').replace(/chương\s*\d+/i, '').trim();

            if (!links.some(l => l.url === href)) {
              links.push({ chapterNumber, title: title || `Chapter ${chapterNumber}`, url: href });
            }
          });
        return links.reverse();
      });
    } finally {
      await page.close();
    }
  }

  async scrapeChapterImages(url: string): Promise<string[]> {
    const page = await openPage();
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
      await sleep(2000);

      return await page.evaluate(() => {
        const imgs: string[] = [];
        document.querySelectorAll('img[alt*="chapter"], .page-image img, #content img, .chapter-content img, .reading img, .page-chapter img')
          .forEach((img) => {
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
