import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
});
const page = await browser.newPage();
await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

// Check last visible page
await page.goto('https://truyentranh.io/dau-pha-thuong-khung/trang-5/', { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 3000));

const data = await page.evaluate(() => {
  const links = Array.from(document.querySelectorAll('a[href*="chuong-"]'));
  const chapters = links.map(a => ({
    href: a.href,
    text: a.textContent?.trim()
  }));
  return {
    count: chapters.length,
    first: chapters[0],
    last: chapters[chapters.length - 1]
  };
});

console.log(JSON.stringify(data, null, 2));
await browser.close();
