const { Report } = require('../Database/database');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');

// POST /api/reports - Create a new report
const createReport = asyncHandler(async (req, res) => {
    const { target_type, target_id, reason, detail } = req.body;

    if (!target_type || !target_id || !reason) {
        throw new AppError('Vui lòng cung cấp đầy đủ thông tin báo cáo', 400);
    }

    if (!['chapter', 'comment'].includes(target_type)) {
        throw new AppError('Loại báo cáo không hợp lệ', 400);
    }

    const report = await Report.create({
        user_id: req.user.id,
        target_type,
        target_id,
        reason,
        detail: detail || ''
    });

    res.status(201).json({
        status: 'success',
        message: 'Báo cáo của bạn đã được gửi thành công. Cảm ơn bạn đã đóng góp!',
        report
    });
});

// GET /api/reports/my - Get current user's reports
const getMyReports = asyncHandler(async (req, res) => {
    const reports = await Report.find({ user_id: req.user.id })
        .sort({ created_at: -1 })
        .limit(50);

    res.json({
        status: 'success',
        reports
    });
});

module.exports = {
    createReport,
    getMyReports
};
