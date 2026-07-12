import { connectDB, mongoose, Pages, Upload } from "../src/database";

export type DuplicatePageGroup = {
  _id: {
    chapter_id: mongoose.Types.ObjectId;
    page_number: number;
  };
  count: number;
  page_ids: mongoose.Types.ObjectId[];
  image_urls: string[];
};

export const canRepairDuplicatePageGroup = (group: DuplicatePageGroup) => group.image_urls.length === 1;

async function findDuplicatePageGroups() {
  return Pages.aggregate<DuplicatePageGroup>([
    {
      $group: {
        _id: { chapter_id: "$chapter_id", page_number: "$page_number" },
        count: { $sum: 1 },
        page_ids: { $push: "$_id" },
        image_urls: { $addToSet: "$image_url" },
      },
    },
    { $match: { count: { $gt: 1 } } },
    { $limit: 20 },
  ]);
}

async function repairIdenticalPageDuplicates(duplicates: DuplicatePageGroup[]) {
  const unrecoverableGroups = duplicates.filter((group) => !canRepairDuplicatePageGroup(group));
  if (unrecoverableGroups.length > 0) {
    throw new Error("Refusing to repair duplicate pages that reference different image objects.");
  }

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      for (const group of duplicates) {
        const pages = await Pages.find({
          chapter_id: group._id.chapter_id,
          page_number: group._id.page_number,
        }).sort({ _id: 1 }).session(session);
        const [, ...redundantPages] = pages;

        if (redundantPages.length > 0) {
          await Pages.deleteMany({ _id: { $in: redundantPages.map((page) => page._id) } }, { session });
        }

        const uploads = await Upload.find({
          chapter_id: group._id.chapter_id,
          page_number: group._id.page_number,
          key: group.image_urls[0],
        }).sort({ created_at: 1, _id: 1 }).session(session);
        const [, ...redundantUploads] = uploads;

        if (redundantUploads.length > 0) {
          await Upload.deleteMany({ _id: { $in: redundantUploads.map((upload) => upload._id) } }, { session });
        }
      }
    });
  } finally {
    await session.endSession();
  }
}

export async function ensurePagesIndex() {
  await connectDB();

  try {
    let duplicates = await findDuplicatePageGroups();

    if (duplicates.length > 0) {
      if (process.env.REPAIR_DUPLICATE_PAGE_MEDIA === "1") {
        await repairIdenticalPageDuplicates(duplicates);
        duplicates = await findDuplicatePageGroups();
      }

      if (duplicates.length > 0) {
        console.error("Cannot create the unique pages index because duplicate chapter/page pairs exist:");
        console.error(JSON.stringify(duplicates, null, 2));
        process.exitCode = 1;
        return;
      }
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
