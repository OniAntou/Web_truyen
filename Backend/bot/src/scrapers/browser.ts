import type { Browser, Page } from 'puppeteer';
import puppeteerExtraLib from 'puppeteer-extra';
import StealthPluginLib from 'puppeteer-extra-plugin-stealth';

const puppeteerExtra = puppeteerExtraLib as any;
const StealthPlugin = StealthPluginLib as any;

let sharedBrowser: Browser | null = null;

export async function initBrowser(): Promise<Browser> {
  if (sharedBrowser) return sharedBrowser;

  puppeteerExtra.use(StealthPlugin());
  
  sharedBrowser = await puppeteerExtra.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  }) as unknown as Browser;

  return sharedBrowser;
}

export async function openPage(): Promise<Page> {
  const browser = await initBrowser();
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
  );

  return page;
}

export async function closeBrowser(): Promise<void> {
  if (sharedBrowser) {
    await sharedBrowser.close();
    sharedBrowser = null;
  }
}

export { sleep } from '../utils.js';
