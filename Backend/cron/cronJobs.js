const { Comic, connectDB } = require('../Database/database');

/**
 * Reset weekly_views to 0.
 * Meant to be called by Vercel Crons.
 */
const resetWeeklyViews = async () => {
  try {
    await connectDB();
    const result = await Comic.updateMany({}, { $set: { weekly_views: 0 } });
    console.log(`[Cron] Reset weekly views for ${result.modifiedCount} comics.`);
    return { success: true, modifiedCount: result.modifiedCount };
  } catch (err) {
    console.error(`[Cron Error] Failed to reset weekly views:`, err);
    throw err;
  }
};

module.exports = { resetWeeklyViews };
