import { AuditLog } from "../database";
import asyncHandler from "../middleware/asyncHandler";

export const getAuditLogs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  // Optional filters with strict type checks and $eq to prevent NoSQL injection
  const filter: Record<string, any> = {};
  if (typeof req.query.action === 'string' && req.query.action.trim()) {
    filter.action = { $eq: req.query.action.trim() };
  }
  if (typeof req.query.targetType === 'string' && req.query.targetType.trim()) {
    filter.target_type = { $eq: req.query.targetType.trim() };
  }
  if (typeof req.query.userId === 'string' && req.query.userId.trim()) {
    filter.user_id = { $eq: req.query.userId.trim() };
  }

  const logs = await AuditLog.find(filter)
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(limit)
    .populate('user_id', 'username email avatar_url')
    .lean();

  const total = await AuditLog.countDocuments(filter);

  res.json({
    logs,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
});
