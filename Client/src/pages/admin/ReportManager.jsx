import React, { useState, useEffect } from 'react';
import { adminReportService } from '../../api/adminReportService';
import { 
    Flag, 
    CheckCircle, 
    XCircle, 
    Trash2, 
    ExternalLink, 
    MessageSquare, 
    FileText,
    Clock,
    User as UserIcon,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Search,
    Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ReportManager = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [isUpdating, setIsUpdating] = useState(null);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const data = await adminReportService.getAllReports({
                page,
                status: statusFilter,
                type: typeFilter,
                limit: 10
            });
            setReports(data.reports);
            setTotal(data.total);
        } catch (err) {
            console.error('Error fetching reports:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [page, statusFilter, typeFilter]);

    const handleUpdateStatus = async (id, status) => {
        setIsUpdating(id);
        try {
            await adminReportService.updateReportStatus(id, status);
            setReports(reports.map(r => r._id === id ? { ...r, status } : r));
        } catch (err) {
            console.error('Error updating status:', err);
        } finally {
            setIsUpdating(null);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa báo cáo này?')) return;
        try {
            await adminReportService.deleteReport(id);
            setReports(reports.filter(r => r._id !== id));
            setTotal(total - 1);
        } catch (err) {
            console.error('Error deleting report:', err);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">Chờ xử lý</span>;
            case 'resolved':
                return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-500/10 text-green-500 border border-green-500/20">Đã giải quyết</span>;
            case 'dismissed':
                return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">Đã bỏ qua</span>;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Flag className="text-rose-500" />
                        Quản lý Báo cáo
                    </h1>
                    <p className="text-zinc-500 text-sm">Xem và xử lý các báo cáo từ người dùng về nội dung lỗi hoặc vi phạm.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-zinc-900/50 p-4 rounded-2xl border border-white/5">
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                    <select 
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="w-full bg-zinc-950 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-rose-500/50 appearance-none"
                    >
                        <option value="">Tất cả loại</option>
                        <option value="chapter">Lỗi Chapter</option>
                        <option value="comment">Vi phạm Bình luận</option>
                    </select>
                </div>
                <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full bg-zinc-950 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-rose-500/50 appearance-none"
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="pending">Chờ xử lý</option>
                        <option value="resolved">Đã giải quyết</option>
                        <option value="dismissed">Đã bỏ qua</option>
                    </select>
                </div>
            </div>

            {/* Reports List */}
            <div className="bg-zinc-900/50 rounded-2xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 text-zinc-400 text-[11px] font-bold uppercase tracking-wider">
                                <th className="px-6 py-4">Người báo cáo</th>
                                <th className="px-6 py-4">Nội dung báo cáo</th>
                                <th className="px-6 py-4">Lý do</th>
                                <th className="px-6 py-4">Trạng thái</th>
                                <th className="px-6 py-4">Thời gian</th>
                                <th className="px-6 py-4 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="6" className="px-6 py-8">
                                            <div className="h-4 bg-white/5 rounded w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : reports.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-zinc-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <AlertCircle size={40} className="opacity-20" />
                                            <p>Không có báo cáo nào được tìm thấy.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                reports.map((report) => (
                                    <tr key={report._id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">
                                                    {report.user_id?.username?.charAt(0).toUpperCase() || '?'}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-white">{report.user_id?.username || 'Người dùng ẩn'}</div>
                                                    <div className="text-[10px] text-zinc-500">{report.user_id?.email || ''}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    {report.target_type === 'chapter' ? (
                                                        <FileText size={14} className="text-blue-400" />
                                                    ) : (
                                                        <MessageSquare size={14} className="text-purple-400" />
                                                    )}
                                                    <span className="text-xs font-bold text-zinc-300">
                                                        {report.target_type === 'chapter' ? 'Chapter' : 'Bình luận'}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-zinc-500 max-w-[200px] truncate">
                                                    {report.targetData ? (
                                                        report.target_type === 'chapter' 
                                                        ? `${report.targetData.comic_id?.title} - ${report.targetData.title}`
                                                        : report.targetData.content
                                                    ) : (
                                                        <span className="italic text-rose-500/50">Nội dung đã bị xóa</span>
                                                    )}
                                                </div>
                                                {report.targetData && (
                                                    <a 
                                                        href={report.target_type === 'chapter' 
                                                            ? `/read/${report.targetData.comic_id?._id}/${report.targetData._id}` 
                                                            : `/p/${report.targetData.comic_id?._id}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[10px] text-rose-500 hover:underline flex items-center gap-1"
                                                    >
                                                        Xem nội dung <ExternalLink size={10} />
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="text-xs font-medium text-white">{report.reason}</div>
                                                {report.detail && (
                                                    <div className="text-[10px] text-zinc-500 bg-black/20 p-1.5 rounded border border-white/5 mt-1 italic">
                                                        "{report.detail}"
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(report.status)}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-zinc-500">
                                            {new Date(report.created_at).toLocaleDateString('vi-VN')}<br/>
                                            {new Date(report.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                {report.status === 'pending' && (
                                                    <>
                                                        <button 
                                                            onClick={() => handleUpdateStatus(report._id, 'resolved')}
                                                            disabled={isUpdating === report._id}
                                                            className="p-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all"
                                                            title="Đánh dấu đã giải quyết"
                                                        >
                                                            <CheckCircle size={16} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleUpdateStatus(report._id, 'dismissed')}
                                                            disabled={isUpdating === report._id}
                                                            className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-all"
                                                            title="Bỏ qua"
                                                        >
                                                            <XCircle size={16} />
                                                        </button>
                                                    </>
                                                )}
                                                <button 
                                                    onClick={() => handleDelete(report._id)}
                                                    className="p-2 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                                    title="Xóa báo cáo"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && total > 10 && (
                    <div className="px-6 py-4 bg-white/5 border-t border-white/5 flex items-center justify-between">
                        <div className="text-xs text-zinc-500">
                            Hiển thị {reports.length} trên tổng số {total} báo cáo
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 disabled:opacity-50 transition-all"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-xs font-bold text-white px-2">Trang {page}</span>
                            <button 
                                onClick={() => setPage(p => p + 1)}
                                disabled={reports.length < 10}
                                className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 disabled:opacity-50 transition-all"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportManager;
