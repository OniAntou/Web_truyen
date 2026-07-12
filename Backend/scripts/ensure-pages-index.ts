import { connectDB, mongoose, Pages } from "../src/database";

export async function ensurePagesIndex() {
  await connectDB();

  try {
    const duplicates = await Pages.aggregate([
      {
        $group: {
          _id: { chapter_id: "$chapter_id", page_number: "$page_number" },
          count: { $sum: 1 },
        },
      },
      { $match: { count: { $gt: 1 } } },
      { $limit: 20 },
    ]);

    if (duplicates.length > 0) {
      console.error("Cannot create the unique pages index because duplicate chapter/page pairs exist:");
      console.error(JSON.stringify(duplicates, null, 2));
      process.exitCode = 1;
      return;
    }

    const indexName = "chapter_id_1_page_number_1";
    const currentIndex = (await Pages.collection.indexes()).find((index) => index.name === indexName);
    if (currentIndex && !currentIndex.unique) {
      await Pages.collection.dropIndex(indexName);
    }

    await Pages.collection.createIndex(
      { chapter_id: 1, page_number: 1 },
      { unique: true, name: indexName },
    );
    console.log("Verified unique pages index.");
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  ensurePagesIndex().catch((error) => {
    console.error("Failed to ensure the unique pages index:", error);
    process.exitCode = 1;
  });
}
