import React, { useEffect, useState, useCallback } from 'react';
import { Search, Trash2, MessageSquare, ChevronLeft, ChevronRight, X, RefreshCw, Filter, CheckSquare, Square, AlertTriangle, BookOpen, User, Clock, Reply } from 'lucide-react';
import { API_BASE_URL } from '../../constants/api';

const DeleteConfirmModal = ({ count, onConfirm, onCancel }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={onCancel}>
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
        <div
            className="relative bg-zinc-900 border border-white/10 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-fadeIn"
            onClick={e => e.stopPropagation()}
        >
            <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
                    <AlertTriangle size={28} className="text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight mb-2">Xác nhận xoá</h3>
                <p className="text-zinc-200 text-sm">
                    Bạn có chắc muốn xoá <span className="text-white font-bold">{count}</span> bình luận?
                    <br />
                    <span className="text-zinc-300 text-xs">Tất cả replies con cũng sẽ bị xoá. Hành động này không thể hoàn tác.</span>
                </p>
            </div>
            <div className="px-8 pb-8 flex items-center justify-center gap-3">
                <button
                    onClick={onCancel}
                    className="px-6 py-3 rounded-xl text-zinc-200 bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-xs font-bold uppercase tracking-wider"
                >
                    Huỷ bỏ
                </button>
                <button
                    onClick={onConfirm}
                    className="px-6 py-3 rounded-xl text-white bg-red-500 hover:bg-red-600 transition-all text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                >
                    Xoá {count} bình luận
                </button>
            </div>
        </div>
    </div>
);

const timeAgo = (dateStr) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return 'Vừa xong';
    if (diffMin < 60) return `${diffMin} phút trước`;
    if (diffHour < 24) return `${diffHour} giờ trước`;
    if (diffDay < 30) return `${diffDay} ngày trước`;
    return date.toLocaleDateString('vi-VN');
};

const CommentManager = () => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [comicFilter, setComicFilter] = useState('');
    const [comicsList, setComicsList] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [deleteModal, setDeleteModal] = useState(null); // null | { type: 'single', id } | { type: 'bulk' }
    const [deleting, setDeleting] = useState(false);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        fetch(`${API_BASE_URL}/admin/comments/comics`, {
            credentials: 'include'
        })
            .then(res => {
                if (res.status === 401 || res.status === 403) {
                    localStorage.removeItem('admin');
                    window.location.href = '/admin/login';
                    return;
                }
                return res.json();
            })
            .then(data => {
                if (data) setComicsList(data);
            })
            .catch(err => console.error('Error fetching comics list:', err));
    }, []);

    const fetchComments = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (debouncedSearch) params.set('search', debouncedSearch);
        if (comicFilter) params.set('comicId', comicFilter);
        params.set('page', page);
        params.set('limit', 15);

        try {
            const res = await fetch(`${API_BASE_URL}/admin/comments?${params.toString()}`, {
                credentials: 'include'
            });
            if (res.status === 401 || res.status === 403) {
                localStorage.removeItem('admin');
                window.location.href = '/admin/login';
                return;
            }
            const data = await res.json();
            setComments(data.comments || []);
            setTotalPages(data.totalPages || 1);
            setTotal(data.total || 0);
        } catch (err) {
            console.error('Error fetching comments:', err);
        }
        setLoading(false);
    }, [debouncedSearch, comicFilter, page]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setPage(1);
        setSelectedIds(new Set());
    }, [debouncedSearch, comicFilter]);

    // Selection handlers
    const toggleSelect = (id) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === comments.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(comments.map(c => c._id)));
        }
    };

    // Delete handlers
    const handleDeleteSingle = async (id) => {
        setDeleting(true);
        try {
            const res = await fetch(`${API_BASE_URL}/admin/comments/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (res.ok) {
                setComments(prev => prev.filter(c => c._id !== id));
                setTotal(prev => prev - 1);
                setSelectedIds(prev => {
                    const next = new Set(prev);
                    next.delete(id);
                    return next;
                });
            } else {
                const err = await res.json();
                alert(err.message || 'Lỗi khi xoá bình luận');
            }
        } catch (e) {
            alert('Lỗi kết nối');
        }
        setDeleting(false);
        setDeleteModal(null);
    };

    const handleBulkDelete = async () => {
        setDeleting(true);
        const ids = Array.from(selectedIds);
        try {
            const res = await fetch(`${API_BASE_URL}/admin/comments/bulk`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ ids })
            });
            if (res.ok) {
                setComments(prev => prev.filter(c => !selectedIds.has(c._id)));
                setTotal(prev => prev - ids.length);
                setSelectedIds(new Set());
            } else {
                const err = await res.json();
                alert(err.message || 'Lỗi khi xoá bình luận');
            }
        } catch (e) {
            alert('Lỗi kết nối');
        }
        setDeleting(false);
        setDeleteModal(null);
    };

    return (
        <div className="mt-12 md:mt-16">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h2 className="text-3xl font-medium text-white tracking-tight flex items-center gap-3">
                        Comment Moderation
                    </h2>
                        Quản lý {total} bình luận trên toàn hệ thống — <span className="text-zinc-300 italic font-medium">Bản ghi quản trị</span>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    {/* Search */}
                    <div className="relative group flex-1 md:w-72">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-white transition-colors" size={16} strokeWidth={2} />
                        <input
                            type="text"
                            placeholder="Tìm theo nội dung..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-zinc-900/40 border border-white/5 rounded-2xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:bg-zinc-800/50 focus:border-white/20 transition-all placeholder-zinc-500"
                        />
                    </div>

                    {/* Filter Toggle */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`p-3 rounded-2xl border transition-all duration-300 ${showFilters ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-zinc-900/40 border-white/5 text-zinc-300 hover:text-white hover:bg-white/5'}`}
                    >
                        <Filter size={18} />
                    </button>

                    {/* Refresh */}
                    <button
                        onClick={fetchComments}
                        className="p-3 rounded-2xl bg-zinc-900/40 border border-white/5 text-zinc-300 hover:text-white hover:bg-white/5 transition-all duration-300"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            {showFilters && (
                <div className="mb-6 flex flex-wrap items-center gap-3 p-5 bg-zinc-900/30 rounded-2xl border border-white/5 animate-fadeIn">
                    <span className="text-zinc-300 text-[10px] font-bold uppercase tracking-widest mr-2">Bộ lọc:</span>

                    {/* Comic Filter */}
                    <div className="flex items-center gap-1.5">
                        <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Truyện:</span>
                        <select
                            value={comicFilter}
                            onChange={e => setComicFilter(e.target.value)}
                            className="bg-black/30 border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-white/20 appearance-none cursor-pointer max-w-[200px]"
                        >
                            <option value="">Tất cả</option>
                            {comicsList.map(c => (
                                <option key={c._id} value={c._id}>{c.title}</option>
                            ))}
                        </select>
                    </div>

                    {comicFilter && (
                        <button
                            onClick={() => setComicFilter('')}
                            className="ml-auto text-zinc-300 hover:text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 transition-colors"
                        >
                            <X size={12} /> Xoá bộ lọc
                        </button>
                    )}
                </div>
            )}

            {/* Bulk Actions Bar */}
            {selectedIds.size > 0 && (
                <div className="mb-4 flex items-center gap-4 p-4 bg-rose-500/5 border border-rose-500/20 rounded-2xl animate-fadeIn">
                    <span className="text-rose-400 text-xs font-bold uppercase tracking-widest">
                        Đã chọn {selectedIds.size} bình luận
                    </span>
                    <button
                        onClick={() => setDeleteModal({ type: 'bulk' })}
                        className="ml-auto px-4 py-2 rounded-xl text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                    >
                        <Trash2 size={14} />
                        Xoá đã chọn
                    </button>
                    <button
                        onClick={() => setSelectedIds(new Set())}
                        className="px-4 py-2 rounded-xl text-zinc-200 bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-xs font-bold uppercase tracking-wider"
                    >
                        Bỏ chọn
                    </button>
                </div>
            )}

            {/* Table */}
            <div className="bg-zinc-900/30 rounded-[2rem] border border-white/5 overflow-hidden backdrop-blur-2xl shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 text-zinc-200 border-b border-white/5 uppercase text-[0.6rem] tracking-widest">
                                <th className="px-4 py-5 font-bold w-10">
                                    <button onClick={toggleSelectAll} className="text-zinc-300 hover:text-white transition-colors">
                                        {selectedIds.size === comments.length && comments.length > 0
                                            ? <CheckSquare size={16} className="text-rose-400" />
                                            : <Square size={16} />
                                        }
                                    </button>
                                </th>
                                <th className="px-4 py-5 font-bold">Người dùng</th>
                                <th className="px-4 py-5 font-bold">Nội dung</th>
                                <th className="px-4 py-5 font-bold">Truyện / Chapter</th>
                                <th className="px-4 py-5 font-bold text-right">Thời gian</th>
                                <th className="px-4 py-5 font-bold text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-zinc-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-16 text-center">
                                        <div className="flex items-center justify-center gap-3">
                                            <div className="w-6 h-6 border-2 border-rose-500/20 border-t-rose-500 rounded-full animate-spin" />
                                            <span className="text-zinc-300 text-xs font-bold uppercase tracking-widest">Đang tải bình luận...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : comments.length > 0 ? comments.map(comment => (
                                <tr
                                    key={comment._id}
                                    className={`transition-colors duration-200 group ${selectedIds.has(comment._id) ? 'bg-rose-500/5' : 'hover:bg-white/[0.03]'}`}
                                >
                                    {/* Checkbox */}
                                    <td className="px-4 py-4">
                                        <button onClick={() => toggleSelect(comment._id)} className="text-zinc-300 hover:text-white transition-colors">
                                            {selectedIds.has(comment._id)
                                                ? <CheckSquare size={16} className="text-rose-400" />
                                                : <Square size={16} />
                                            }
                                        </button>
                                    </td>

                                    {/* User */}
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500/10 to-violet-500/10 border border-white/10 flex items-center justify-center shrink-0">
                                                <span className="text-sm font-bold text-white">
                                                    {comment.user_id?.username?.charAt(0)?.toUpperCase() || '?'}
                                                </span>
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-semibold text-white text-sm tracking-tight truncate max-w-[120px]">
                                                    {comment.user_id?.username || 'Đã xoá'}
                                                </div>
                                                <div className="text-[10px] text-zinc-400 font-medium mt-0.5 truncate max-w-[120px]">
                                                    {comment.user_id?.email || '—'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Content */}
                                    <td className="px-4 py-4 max-w-xs">
                                        <div className="space-y-1">
                                            {comment.parent_id && (
                                                <div className="flex items-center gap-1.5 text-zinc-400">
                                                    <Reply size={10} className="shrink-0 rotate-180" />
                                                    <span className="text-[10px] font-medium truncate max-w-[200px] italic">
                                                        {comment.parent_id?.content || 'Reply'}
                                                    </span>
                                                </div>
                                            )}
                                            <p className="text-white text-sm leading-relaxed line-clamp-2">
                                                {comment.content}
                                            </p>
                                        </div>
                                    </td>

                                    {/* Comic / Chapter */}
                                    <td className="px-4 py-4">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <BookOpen size={12} className="text-rose-500 shrink-0" />
                                                <span className="text-white text-xs font-semibold truncate max-w-[160px]">
                                                    {comment.comic_id?.title || 'Truyện đã xoá'}
                                                </span>
                                            </div>
                                            {comment.chapter_id && (
                                                <div className="text-[10px] text-zinc-300 font-medium mt-1 pl-[18px]">
                                                    Ch.{comment.chapter_id.chapter_number} — {comment.chapter_id.title || ''}
                                                </div>
                                            )}
                                            {!comment.chapter_id && (
                                                <div className="text-[10px] text-zinc-400 font-medium mt-1 pl-[18px]">
                                                    Bình luận chung
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    {/* Time */}
                                    <td className="px-4 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1.5 text-zinc-500">
                                            <Clock size={12} />
                                            <span className="text-xs font-medium tabular-nums whitespace-nowrap text-zinc-300">
                                                {timeAgo(comment.created_at)}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-4 py-4 text-right">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDeleteModal({ type: 'single', id: comment._id });
                                            }}
                                            className="p-2 text-zinc-300 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200"
                                            title="Xoá bình luận"
                                        >
                                            <Trash2 size={16} strokeWidth={1.5} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-16 text-center">
                                        <MessageSquare size={32} className="mx-auto text-zinc-700 mb-3" />
                                        <p className="text-zinc-300 text-sm tracking-wide">Không tìm thấy bình luận nào.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-white/5">
                        <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
                            Trang {page} / {totalPages} • {total} bình luận
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={16} />
                            </button>

                            {/* Page numbers */}
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (page <= 3) {
                                    pageNum = i + 1;
                                } else if (page >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = page - 2 + i;
                                }
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setPage(pageNum)}
                                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                                            pageNum === page
                                                ? 'bg-white text-black'
                                                : 'text-zinc-300 hover:text-white hover:bg-white/5'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteModal && (
                <DeleteConfirmModal
                    count={deleteModal.type === 'single' ? 1 : selectedIds.size}
                    onConfirm={() => {
                        if (deleteModal.type === 'single') {
                            handleDeleteSingle(deleteModal.id);
                        } else {
                            handleBulkDelete();
                        }
                    }}
                    onCancel={() => setDeleteModal(null)}
                />
            )}

            {/* Animation keyframes */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95) translateY(10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </div>
    );
};

export default CommentManager;
