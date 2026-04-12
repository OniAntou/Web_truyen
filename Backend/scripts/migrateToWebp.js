require('dotenv').config();
const { Comic, Pages, connectDB, mongoose } = require('../Database/database');
const { downloadFromR2, uploadToR2, R2_ENABLED } = require('../config/r2');
const { convertToWebp } = require('../utils/imageHelper');

const BATCH_SIZE = 10; // Process 10 images at a time to avoid overwhelming the server

async function migrate() {
  if (!R2_ENABLED) {
    console.error('R2 is not enabled. Please check your .env file.');
    process.exit(1);
  }

  await connectDB();
  console.log('Starting migration to WebP...');

  // 1. Migrate Comic Covers
  console.log('--- Migrating Comic Covers ---');
  const comics = await Comic.find({ cover_url: { $regex: /r2:(?!.*\.webp$)/ } });
  console.log(`Found ${comics.length} covers to migrate.`);

  for (let i = 0; i < comics.length; i += BATCH_SIZE) {
    const batch = comics.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map(async (comic) => {
      try {
        console.log(`Processing cover for comic: ${comic.title}`);
        const buffer = await downloadFromR2(comic.cover_url);
        if (!buffer) return;

        const webpBuffer = await convertToWebp(buffer);
        const oldKey = comic.cover_url.replace('r2:', '');
        const newKey = oldKey.replace(/\.[^/.]+$/, "") + ".webp";
        
        const { key: r2Key } = await uploadToR2(newKey, webpBuffer, 'image/webp');
        
        comic.cover_url = r2Key;
        await comic.save();
        console.log(`Successfully migrated cover for: ${comic.title} -> ${r2Key}`);
      } catch (err) {
        console.error(`Failed to migrate cover for ${comic.title || comic._id}:`, err);
      }
    }));
  }

  // 2. Migrate Chapter Pages
  console.log('\n--- Migrating Chapter Pages ---');
  const pages = await Pages.find({ image_url: { $regex: /r2:(?!.*\.webp$)/ } });
  console.log(`Found ${pages.length} pages to migrate.`);

  for (let i = 0; i < pages.length; i += BATCH_SIZE) {
    const batch = pages.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map(async (page) => {
      try {
        const buffer = await downloadFromR2(page.image_url);
        if (!buffer) return;

        const webpBuffer = await convertToWebp(buffer);
        const oldKey = page.image_url.replace('r2:', '');
        const newKey = oldKey.replace(/\.[^/.]+$/, "") + ".webp";
        
        const { key: r2Key } = await uploadToR2(newKey, webpBuffer, 'image/webp');
        
        page.image_url = r2Key;
        await page.save();
        // console.log(`Migrated page ${page.page_number} Chapter ${page.chapter_id} -> ${r2Key}`);
      } catch (err) {
        console.error(`Failed to migrate page ${page._id}:`, err);
      }
    }));
    console.log(`Progress: ${Math.min(i + BATCH_SIZE, pages.length)}/${pages.length} pages processed.`);
  }

  console.log('\nMigration completed successfully!');
  await mongoose.disconnect();
  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
