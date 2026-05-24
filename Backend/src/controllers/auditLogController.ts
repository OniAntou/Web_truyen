import { AuditLog } from "../database";
import asyncHandler from "../middleware/asyncHandler";

export const getAuditLogs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  // Optional filters
  const filter: any = {};
  if (req.query.action) {
    filter.action = req.query.action;
  }
  if (req.query.targetType) {
    filter.target_type = req.query.targetType;
  }
  if (req.query.userId) {
    filter.user_id = req.query.userId;
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
