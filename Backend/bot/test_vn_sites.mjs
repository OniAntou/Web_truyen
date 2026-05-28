import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });

async function inspectChapter(url, label) {
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });
    await new Promise(r => setTimeout(r, 3000));
    
    const data = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'))
        .map(img => ({ src: img.src, alt: img.alt, cls: img.className, parent: img.parentElement?.tagName }))
        .filter(x => x.src && x.src.match(/\.(jpg|jpeg|png|webp)/i))
        .slice(0, 10);
      const allImgSrcs = Array.from(document.querySelectorAll('img'))
        .map(img => img.src)
        .filter(s => s && s.match(/\.(jpg|jpeg|png|webp)/i) && s.startsWith('http'))
        .slice(0, 20);
      return { imgs, allImgSrcs };
    });
    
    console.log(`${label}:`);
    console.log(`  images: ${JSON.stringify(data.imgs.slice(0,3), null, 2)}`);
    console.log(`  all img srcs: ${JSON.stringify(data.allImgSrcs.slice(0,5), null, 2)}`);
  } catch(e) {
    console.log(`${label}: ERROR - ${e.message}`);
  }
  await page.close();
}

await inspectChapter('https://truyentranh.io/dau-pha-thuong-khung/chuong-1/', 'truyentranh.io chapter 1');

await browser.close();
