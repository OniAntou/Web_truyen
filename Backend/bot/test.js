import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
puppeteer.use(StealthPlugin());

(async () => {
  const b = await puppeteer.launch({headless: true, args: ['--no-sandbox']});
  const p = await b.newPage();
  await p.goto('https://truyentranh.io/one-piece/');
  
  const chapters = await p.evaluate(() => 
    Array.from(document.querySelectorAll('a[href*="chuong-"]')).map(a => a.textContent.trim()).slice(0, 10)
  );
  console.log('Top chapters:', chapters);
  
  const paging = await p.evaluate(() => document.documentElement.innerHTML.includes('eTruyen-paging'));
  console.log('Has paging:', paging);
  
  await b.close();
})();
