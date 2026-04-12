const cron = require('node-cron');
const { Comic } = require('../Database/database');

const initCronJobs = () => {
  // Reset weekly_views to 0 every Monday at 00:00
  cron.schedule('0 0 * * 1', async () => {
    try {
      const result = await Comic.updateMany({}, { $set: { weekly_views: 0 } });
      console.log(`[Cron] Reset weekly views for ${result.modifiedCount} comics.`);
    } catch (err) {
      console.error(`[Cron Error] Failed to reset weekly views:`, err);
    }
  });
};

module.exports = { initCronJobs };
