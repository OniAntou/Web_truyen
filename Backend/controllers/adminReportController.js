const { Report, User, Chapter, Comment, Comic } = require('../Database/database');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');

// GET /api/admin/reports - Get all reports with filters
const getAllReports = asyncHandler(async (req, res) => {
    const { status, type, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (type) filter.target_type = type;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const reports = await Report.find(filter)
        .populate('user_id', 'username email avatar')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

    // Populate target data manually because target_id is dynamic
    const populatedReports = await Promise.all(reports.map(async (report) => {
        let targetData = null;
        if (report.target_type === 'chapter') {
            targetData = await Chapter.findById(report.target_id)
                .populate('comic_id', 'title cover_url')
                .lean();
        } else if (report.target_type === 'comment') {
            targetData = await Comment.findById(report.target_id)
                .populate('user_id', 'username')
                .populate('comic_id', 'title')
                .lean();
        }
        return { ...report, targetData };
    }));

    const total = await Report.countDocuments(filter);

    res.json({
        status: 'success',
        reports: populatedReports,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit))
    });
});

// PATCH /api/admin/reports/:id/status - Update report status
const updateReportStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    
    if (!['pending', 'resolved', 'dismissed'].includes(status)) {
        throw new AppError('Trạng thái không hợp lệ', 400);
    }

    const report = await Report.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true, runValidators: true }
    );

    if (!report) {
        throw new AppError('Không tìm thấy báo cáo', 404);
    }

    res.json({
        status: 'success',
        message: 'Cập nhật trạng thái báo cáo thành công',
        report
    });
});

// DELETE /api/admin/reports/:id - Delete a report
const deleteReport = asyncHandler(async (req, res) => {
    const report = await Report.findByIdAndDelete(req.params.id);

    if (!report) {
        throw new AppError('Không tìm thấy báo cáo', 404);
    }

    res.json({
        status: 'success',
        message: 'Đã xóa báo cáo thành công'
    });
});

module.exports = {
    getAllReports,
    updateReportStatus,
    deleteReport
};
