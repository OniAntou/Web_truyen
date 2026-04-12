require('dotenv').config();
const { Comic, Pages, Upload, connectDB, mongoose } = require('../Database/database');
const { deleteFromR2, R2_ENABLED } = require('../config/r2');

async function cleanup() {
  if (!R2_ENABLED) {
    console.error('R2 not enabled.');
    process.exit(1);
  }

  await connectDB();
  console.log('Starting cleanup of old JPG/PNG images...');

  // Find all uploads that are still JPG/PNG/JPEG
  const oldUploads = await Upload.find({
    key: { $regex: /r2:.*\.(jpg|jpeg|png)$/i }
  });

  console.log(`Found ${oldUploads.length} legacy upload records.`);

  let successCount = 0;
  let failCount = 0;

  for (const upload of oldUploads) {
    try {
      // Logic check: only delete if a webp version exists for this comic/page
      let migrated = false;
      if (upload.type === 'cover') {
        const comic = await Comic.findById(upload.comic_id);
        if (comic && comic.cover_url && comic.cover_url.endsWith('.webp')) migrated = true;
      } else if (upload.type === 'page') {
        const page = await Pages.findOne({ chapter_id: upload.chapter_id, page_number: upload.page_number });
        if (page && page.image_url && page.image_url.endsWith('.webp')) migrated = true;
      }

      if (migrated) {
        console.log(`Deleting old file: ${upload.key}`);
        await deleteFromR2(upload.key);
        
        // Update the upload record to point to the new webp key or delete it?
        // It's cleaner to update it so we have a history of the webp upload
        const newKey = upload.key.replace(/\.[^/.]+$/, "") + ".webp";
        upload.key = newKey;
        await upload.save();
        
        successCount++;
      } else {
        console.log(`Skipping ${upload.key} (No WebP version found in DB)`);
        failCount++;
      }
    } catch (err) {
      console.error(`Error cleaning up ${upload.key}:`, err);
      failCount++;
    }

    if ((successCount + failCount) % 50 === 0) {
      console.log(`Progress: ${successCount + failCount}/${oldUploads.length} attempted.`);
    }
  }

  console.log(`\nCleanup completed!`);
  console.log(`Deleted: ${successCount}`);
  console.log(`Skipped/Failed: ${failCount}`);
  
  await mongoose.disconnect();
}

cleanup().catch(err => {
  console.error('Cleanup failed:', err);
  process.exit(1);
});
