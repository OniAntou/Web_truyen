const express = require('express');
const router = express.Router();
const { resetWeeklyViews } = require('../cron/cronJobs');

/**
 * Endpoint for Vercel Crons
 * Secured by CRON_SECRET environment variable
 */
router.get('/reset-weekly-views', async (req, res) => {
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;

  // Validate CRON_SECRET if it exists
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const result = await resetWeeklyViews();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
