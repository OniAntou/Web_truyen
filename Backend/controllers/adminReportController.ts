import {  Report, User, Chapter, Comment, Comic  } from "../Database/database";
import asyncHandler from "../middleware/asyncHandler";
import AppError from "../utils/AppError";

// GET /api/admin/reports - Get all reports with filters
const getAllReports = asyncHandler(async (req, res) => {
    const status = req.query.status ? String(req.query.status) : undefined;
    const type = req.query.type ? String(req.query.type) : undefined;
    const page = parseInt(String(req.query.page || '1'));
    const limit = parseInt(String(req.query.limit || '20'));

    const filter: any = {};
    if (status) filter.status = String(status);
    if (type) filter.target_type = String(type);

    const skip = (page - 1) * limit;
    
    const reports = await Report.find(filter)
        .populate('user_id', 'username email avatar')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
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
        page: page,
        totalPages: Math.ceil(total / limit)
    });
});

// PATCH /api/admin/reports/:id/status - Update report status
const updateReportStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    
    if (!['pending', 'resolved', 'dismissed'].includes(status)) {
        throw new AppError('Trạng thái không hợp lệ', 400);
    }

    const validatedStatus = String(status);

    const report = await Report.findByIdAndUpdate(
        String(req.params.id),
        { $set: { status: validatedStatus } },
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
    const report = await Report.findByIdAndDelete(String(req.params.id));

    if (!report) {
        throw new AppError('Không tìm thấy báo cáo', 404);
    }

    res.json({
        status: 'success',
        message: 'Đã xóa báo cáo thành công'
    });
});

export { 
    getAllReports,
    updateReportStatus,
    deleteReport
 };
