require('dotenv').config();
const mongoose = require('mongoose');
const { Comic, Chapter, connectDB } = require('../Database/database');

async function sync() {
  try {
    console.log('Connecting to database...');
    await connectDB();
    console.log('Connected.');

    const comics = await Comic.find({});
    console.log(`Found ${comics.length} comics to sync.`);

    for (const comic of comics) {
      const count = await Chapter.countDocuments({ comic_id: comic._id });
      await Comic.findByIdAndUpdate(comic._id, { chapter_count: count });
      console.log(`Updated comic "${comic.title}": ${count} chapters.`);
    }

    console.log('Sync completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error during sync:', err);
    process.exit(1);
  }
}

sync();
