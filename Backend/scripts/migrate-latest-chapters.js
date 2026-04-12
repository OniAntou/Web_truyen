const dotenv = require("dotenv");
const mongoose = require("mongoose");
const path = require("path");

// Load env from Backend/.env
dotenv.config({ path: path.join(__dirname, "../.env") });

const { Comic, Chapter, connectDB } = require("../Database/database");

async function migrate() {
  try {
    await connectDB();
    console.log("Connected to database for migration...");

    const comics = await Comic.find({});
    console.log(`Found ${comics.length} comics to process.`);

    for (const comic of comics) {
      // Find the latest chapter for this comic
      const latestChapter = await Chapter.findOne({ comic_id: comic._id })
        .sort({ chapter_number: -1 })
        .select("_id chapter_number title created_at")
        .lean();

      if (latestChapter) {
        await Comic.findByIdAndUpdate(comic._id, {
          $set: {
            latest_chapter: {
              id: latestChapter._id,
              chapter_number: latestChapter.chapter_number,
              title: latestChapter.title,
              created_at: latestChapter.created_at,
            },
          },
        });
        console.log(`Updated comic: ${comic.title} with chapter ${latestChapter.chapter_number}`);
      } else {
        console.log(`No chapters found for comic: ${comic.title}`);
      }
    }

    console.log("Migration completed successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

migrate();
