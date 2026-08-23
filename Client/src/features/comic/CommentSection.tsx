import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { commentService } from '../../services/commentService';
import ReportModal from '../../components/common/ReportModal';
import { Flag } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface Comment {
    _id: string;
    content: string;
    user_id: {
        _id: string;
        username: string;
    };
    parent_id?: string;
    created_at: string;
}

interface CommentSectionProps {
    comicId: string;
    chapterId?: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ comicId, chapterId }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [replyingTo, setReplyingTo] = useState<string | null>(null); // id of root comment
    const [reportModal, setReportModal] = useState<{ isOpen: boolean; targetId: string | null }>({ isOpen: false, targetId: null });
    
    const user = useAuthStore(state => state.user);

    const fetchComments = () => {
        commentService.getByComic(comicId, chapterId || null)
            .then((data: Comment[] | Record<string, unknown>) => {
                if (Array.isArray(data)) setComments(data);
            })
            .catch(console.error);
    };

    useEffect(() => {
        if (comicId) fetchComments();
        // Reset when changing chapter
        setReplyingTo(null);
        setNewComment("");
    }, [comicId, chapterId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        if (!user) return alert('Vui lòng đăng nhập để bình luận');
        
        setIsSubmitting(true);
        try {
            const getTargetParentId = (t_id: string | null) => {
                if (!t_id) return null;
                const target = comments.find(x => x._id === t_id);
                return target?.parent_id ? target.parent_id : t_id;
            };
            const actualParentId = getTargetParentId(replyingTo);
            
            await commentService.create(comicId, newComment, chapterId || null, actualParentId || null);
            setNewComment("");
            setReplyingTo(null);
            fetchComments();
        } catch (err: unknown) {
            console.error(err);
            const message = err instanceof Error ? err.message : String(err);
            alert(message || 'Lỗi khi gửi bình luận');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (commentId: string) => {
        if (!window.confirm('Bạn có chắc muốn xoá bình luận này?')) return;
        setDeletingId(commentId);
        try {
            await commentService.delete(comicId, commentId);
            fetchComments();
        } catch (err: unknown) {
            console.error(err);
            const message = err instanceof Error ? err.message : String(err);
            alert(message || 'Lỗi khi xoá bình luận');
        } finally {
            setDeletingId(null);
        }
    };

    const canDelete = (comment: Comment) => {
        if (!user) return false;
        const isOwner = comment.user_id?._id === user.id;
        const isAdmin = user.role === 'admin';
        return isOwner || isAdmin;
    };

    // Organize comments
    const rootComments = comments.filter(c => !c.parent_id);
    const getReplies = (parentId: string) => comments.filter(c => c.parent_id === parentId).sort((a,b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    const renderComment = (c: Comment, isReply = false) => {
        const replies = isReply ? [] : getReplies(c._id);
        const isBeingReplied = replyingTo === c._id;
        
        return (
            <div 
                key={c._id} 
                className={`flex flex-col gap-3 transition-opacity duration-200 ${
                    isReply 
                        ? 'p-3.5 sm:p-4 rounded-2xl bg-[var(--bg-primary)]/60 border-l-2 border-[var(--accent)] ml-4 sm:ml-8 mt-2' 
                        : 'p-4 sm:p-5 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border)] shadow-sm'
                } ${deletingId === c._id ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}
            >
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5 flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                        <div className={`rounded-full bg-gradient-to-tr from-[var(--accent)] to-rose-400 flex items-center justify-center text-white font-extrabold shadow-sm ${
                            isReply ? 'w-6 h-6 text-[10px]' : 'w-8 h-8 text-xs'
                        }`}>
                            {c.user_id?.username ? c.user_id.username.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <strong className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                            {c.user_id?.username || 'Người dùng ẩn danh'}
                        </strong>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)]">
                        <span>{new Date(c.created_at).toLocaleString('vi-VN')}</span>
                        {canDelete(c) && (
                            <button
                                onClick={() => handleDelete(c._id)}
                                disabled={deletingId === c._id}
                                title="Xoá bình luận"
                                className="p-1 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 text-[var(--text-muted)] transition-colors"
                            >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                <p className="text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
                    {c.content}
                </p>
                
                {/* Actions Row */}
                <div className="flex items-center gap-4 pt-1">
                    <button 
                        onClick={() => {
                            if (isBeingReplied) {
                                setReplyingTo(null);
                                setNewComment("");
                            } else {
                                setReplyingTo(c._id);
                                const username = c.user_id?.username;
                                setNewComment(username ? `@${username} ` : "");
                            }
                        }}
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold hover:text-[var(--accent)] transition-colors ${
                            isBeingReplied ? 'text-[var(--accent)] font-bold' : 'text-[var(--text-secondary)]'
                        }`}
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <span>{isBeingReplied ? 'Huỷ' : 'Trả lời'}</span>
                    </button>

                    <button 
                        onClick={() => setReportModal({ isOpen: true, targetId: c._id })}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] hover:text-rose-500 transition-colors"
                    >
                        <Flag size={12} />
                        <span>Báo cáo</span>
                    </button>
                </div>

                {/* Reply Form */}
                {isBeingReplied && (
                    <div className="mt-2 p-3.5 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border)]">
                        {user ? (
                            <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
                                <textarea 
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder={`Phản hồi ${c.user_id?.username || 'người dùng'}...`}
                                    autoFocus
                                    onFocus={(e) => e.currentTarget.setSelectionRange(e.currentTarget.value.length, e.currentTarget.value.length)}
                                    className="w-full min-h-[60px] p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent)] resize-y transition-colors"
                                />
                                <div className="flex justify-end gap-2">
                                    <button 
                                        type="button" 
                                        onClick={() => { setReplyingTo(null); setNewComment(""); }} 
                                        className="px-3 py-1.5 rounded-full text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] border border-transparent transition-colors"
                                    >
                                        Huỷ
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={isSubmitting || !newComment.trim()} 
                                        className="px-4 py-1.5 rounded-full text-xs font-bold text-white bg-[var(--accent)] hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all shadow-sm"
                                    >
                                        {isSubmitting ? 'Đang gửi...' : 'Gửi'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <p className="text-xs text-[var(--text-secondary)]">Vui lòng <Link to="/auth" className="text-[var(--accent)] font-bold">đăng nhập</Link> để trả lời.</p>
                        )}
                    </div>
                )}

                {/* Render Replies */}
                {replies.length > 0 && (
                    <div className="flex flex-col gap-1 mt-1">
                        {replies.map(reply => renderComment(reply, true))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl mt-12 mb-16">
            <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-[var(--border)]">
                <div className="w-1.5 h-5 rounded-full bg-[var(--accent)]" />
                <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
                    Bình Luận ({comments.length})
                </h3>
            </div>

            <div className="rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border)] p-4 sm:p-6 shadow-sm">
                {user && !replyingTo ? (
                    <form onSubmit={handleSubmit} className="mb-6">
                        <textarea 
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Chia sẻ cảm nghĩ của bạn về tác phẩm này..."
                            className="w-full min-h-[90px] p-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border)] text-xs sm:text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent)] resize-y mb-3 transition-colors shadow-inner"
                        />
                        <div className="flex justify-end">
                            <button 
                                type="submit" 
                                disabled={isSubmitting || !newComment.trim()} 
                                className="px-6 py-2.5 rounded-full text-xs uppercase tracking-wider font-extrabold text-white bg-[var(--accent)] shadow-md shadow-[var(--accent)]/20 hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all"
                            >
                                {isSubmitting ? 'Đang gửi...' : 'Gửi Bình Luận'}
                            </button>
                        </div>
                    </form>
                ) : !user ? (
                    <div className="p-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border)] text-center mb-6">
                        <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                            Vui lòng <Link to="/auth" className="text-[var(--accent)] font-bold hover:underline">đăng nhập</Link> để tham gia bình luận cùng cộng đồng.
                        </p>
                    </div>
                ) : null}

                <div className="flex flex-col gap-3">
                    {rootComments.length > 0 ? (
                        rootComments.map(c => renderComment(c))
                    ) : (
                        <div className="py-12 text-center text-xs text-[var(--text-muted)] italic">
                            Chưa có bình luận nào. Hãy là người đầu tiên để lại ý kiến!
                        </div>
                    )}
                </div>
            </div>

            {reportModal.isOpen && (
                <ReportModal
                    isOpen={reportModal.isOpen}
                    onClose={() => setReportModal({ isOpen: false, targetId: null })}
                    targetType="comment"
                    targetId={reportModal.targetId!}
                />
            )}
        </div>
    );
};

export default CommentSection;
