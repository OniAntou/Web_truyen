export interface ComicMeta {
  title: string;
  author: string;
  artist?: string;
  status: 'Ongoing' | 'Completed' | 'Hiatus';
  description: string;
  genres: string[];
  coverUrl: string;
  sourceUrl: string;
}

export interface ChapterMeta {
  chapterNumber: number;
  title: string;
  url: string;
}

export interface Scraper {
  name: string;
  canHandle(url: string): boolean;
  scrapeMeta(url: string): Promise<ComicMeta>;
  scrapeChapterList(url: string): Promise<ChapterMeta[]>;
  scrapeChapterImages(url: string): Promise<string[]>;
}
