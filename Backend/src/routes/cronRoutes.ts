import express from "express";
import { resetWeeklyViews } from "../cron/cronJobs";
import { isCronAuthorized } from "../utils/accessControl";

const router = express.Router();

router.get("/reset-weekly-views", async (req, res) => {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return res.status(503).json({ message: "CRON_SECRET is not configured" });
  }

  if (!isCronAuthorized(cronSecret, req.headers.authorization)) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    res.json(await resetWeeklyViews());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
