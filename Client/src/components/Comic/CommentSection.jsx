import React from 'react';
import { Link } from 'react-router-dom';
import { commentService } from '../../api/commentService';
import ReportModal from '../common/ReportModal';
import { Flag } from 'lucide-react';

// Decode JWT to get user info (id, role)
const decodeToken = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const paddedBase64 = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
        
        return JSON.parse(
            decodeURIComponent(
                atob(paddedBase64).split('').map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join('')
            )
        );
    } catch {
        return null;
    }
};

const CommentSection = ({ comicId, chapterId }) => {
    const [comments, setComments] = React.useState([]);
    const [newComment, setNewComment] = React.useState("");
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [deletingId, setDeletingId] = React.useState(null);
    const [replyingTo, setReplyingTo] = React.useState(null); // id of root comment
    const [reportModal, setReportModal] = React.useState({ isOpen: false, targetId: null });
    
    const token = localStorage.getItem('token');
    const currentUser = token ? decodeToken(token) : null;

    const fetchComments = () => {
        commentService.getByComic(comicId, chapterId)
            .then(data => {
                if (Array.isArray(data)) setComments(data);
            })
            .catch(console.error);
    };

    React.useEffect(() => {
        if (comicId) fetchComments();
        // Reset when changing chapter
        setReplyingTo(null);
        setNewComment("");
    }, [comicId, chapterId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        if (!token) return alert('Vui lòng đăng nhập để bình luận');
        
        setIsSubmitting(true);
        try {
            const getTargetParentId = (t_id) => {
                if (!t_id) return null;
                const target = comments.find(x => x._id === t_id);
                return target?.parent_id ? target.parent_id : t_id;
            };
            const actualParentId = getTargetParentId(replyingTo);
            
            await commentService.create(comicId, newComment, chapterId, actualParentId, token);
            setNewComment("");
            setReplyingTo(null);
            fetchComments();
        } catch (err) {
            console.error(err);
            alert(err || 'Lỗi khi gửi bình luận');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (commentId) => {
        if (!window.confirm('Bạn có chắc muốn xoá bình luận này?')) return;
        setDeletingId(commentId);
        try {
            await commentService.delete(comicId, commentId, token);
            fetchComments();
        } catch (err) {
            console.error(err);
            alert(err || 'Lỗi khi xoá bình luận');
        } finally {
            setDeletingId(null);
        }
    };

    const canDelete = (comment) => {
        if (!currentUser) return false;
        const isOwner = comment.user_id?._id === currentUser.id;
        const isAdmin = currentUser.role === 'admin';
        return isOwner || isAdmin;
    };

    // Organize comments
    const rootComments = comments.filter(c => !c.parent_id);
    const getReplies = (parentId) => comments.filter(c => c.parent_id === parentId).sort((a,b) => new Date(a.created_at) - new Date(b.created_at));

    const renderComment = (c, isReply = false) => {
        const replies = isReply ? [] : getReplies(c._id);
        const isBeingReplied = replyingTo === c._id;
        
        return (
            <div key={c._id} style={{ 
                display: 'flex', flexDirection: 'column', gap: '0.75rem',
                padding: isReply ? '1rem' : '1.5rem', 
                background: isReply ? 'rgba(255, 255, 255, 0.03)' : 'var(--bg-secondary)', 
                borderRadius: '0.75rem', 
                border: isReply ? 'none' : '1px solid var(--border)',
                borderLeft: isReply ? '3px solid rgba(255, 255, 255, 0.1)' : '1px solid var(--border)',
                marginLeft: isReply ? '1.5rem' : '0',
                marginTop: isReply ? '0.5rem' : '0',
                opacity: deletingId === c._id ? 0.5 : 1,
                transition: 'opacity 0.2s',
                position: 'relative'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: isReply ? '24px' : '32px', height: isReply ? '24px' : '32px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: isReply ? '0.75rem' : '0.9rem' }}>
                                {c.user_id?.username ? c.user_id.username.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <strong style={{ color: '#eab308', fontSize: isReply ? '0.95rem' : '1.1rem' }}>{c.user_id?.username || 'Người dùng ẩn danh'}</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {new Date(c.created_at).toLocaleString('vi-VN')}
                        </span>
                        {canDelete(c) && (
                            <button
                                onClick={() => handleDelete(c._id)}
                                disabled={deletingId === c._id}
                                title="Xoá bình luận"
                                className="comment-action-btn hover-danger"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
                <p style={{ margin: 0, color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: '1.5', fontSize: '0.95rem' }}>{c.content}</p>
                
                {/* Actions Row */}
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
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
                        className="comment-action-btn hover-accent"
                        style={{ color: isBeingReplied ? 'var(--accent)' : 'var(--text-secondary)' }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        {isBeingReplied ? 'Huỷ trả lời' : 'Trả lời'}
                    </button>

                    <button 
                        onClick={() => setReportModal({ isOpen: true, targetId: c._id })}
                        className="comment-action-btn hover-rose"
                    >
                        <Flag size={14} />
                        Báo cáo
                    </button>
                </div>

                {/* Reply Form */}
                {isBeingReplied && (
                    <div style={{ marginTop: '0.5rem', padding: '1rem', borderRadius: '0.5rem', background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
                        {token ? (
                            <form onSubmit={handleSubmit}>
                                <textarea 
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder={`Phản hồi ${c.user_id?.username || 'người dùng'}...`}
                                    autoFocus
                                    onFocus={(e) => e.currentTarget.setSelectionRange(e.currentTarget.value.length, e.currentTarget.value.length)}
                                    style={{ 
                                        width: '100%', minHeight: '60px', padding: '0.75rem', 
                                        borderRadius: '0.5rem', background: 'transparent', 
                                        border: '1px solid var(--border)', color: 'var(--text-primary)',
                                        marginBottom: '0.75rem', resize: 'vertical', outline: 'none'
                                    }}
                                />
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                    <button type="button" onClick={() => { setReplyingTo(null); setNewComment(""); }} className="btn btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}>Huỷ</button>
                                    <button type="submit" className="btn btn-primary" disabled={isSubmitting || !newComment.trim()} style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}>
                                        {isSubmitting ? 'Đang gửi...' : 'Gửi'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>Vui lòng <Link to="/auth" style={{ color: '#eab308' }}>đăng nhập</Link> để trả lời.</p>
                        )}
                    </div>
                )}

                {/* Render Replies */}
                {replies.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0', marginTop: '0.5rem' }}>
                        {replies.map(reply => renderComment(reply, true))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="container" style={{ marginTop: '1rem', paddingBottom: '3rem' }}>
            <h3 className="section-title" style={{ marginBottom: '1.5rem' }}>Bình luận</h3>
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
                {token && !replyingTo ? (
                    <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
                        <textarea 
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Nhập bình luận của bạn..."
                            style={{ 
                                width: '100%', minHeight: '80px', padding: '1rem', 
                                borderRadius: '0.5rem', background: 'var(--bg-primary)', 
                                border: '1px solid var(--border)', color: 'var(--text-primary)',
                                marginBottom: '1rem',
                                resize: 'vertical',
                                outline: 'none'
                            }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button type="submit" className="btn btn-primary" disabled={isSubmitting || !newComment.trim()}>
                                {isSubmitting ? 'Đang gửi...' : 'Gửi bình luận'}
                            </button>
                        </div>
                    </form>
                ) : (!token && !replyingTo && (
                    <div style={{ padding: '1rem', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '0.5rem', marginBottom: '2rem', border: '1px solid var(--border)' }}>
                        <p style={{ color: 'var(--text-secondary)' }}>Vui lòng <Link to="/auth" style={{ color: '#eab308', textDecoration: 'none' }}>đăng nhập</Link> để tham gia bình luận.</p>
                    </div>
                ))}

                <div className="comments-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {rootComments.length > 0 ? rootComments.map(c => renderComment(c, false)) : (
                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 0' }}>Chưa có bình luận nào. Hãy là người đầu tiên!</p>
                    )}
                </div>
            </div>

            <ReportModal 
                isOpen={reportModal.isOpen}
                onClose={() => setReportModal({ ...reportModal, isOpen: false })}
                targetType="comment"
                targetId={reportModal.targetId}
            />

            <style>{`
                .comment-action-btn {
                    background: none;
                    border: 1px solid transparent;
                    border-radius: 0.375rem;
                    padding: 0.25rem 0.5rem;
                    cursor: pointer;
                    color: var(--text-secondary);
                    font-size: 0.8rem;
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    transition: all 0.2s;
                    font-family: inherit;
                }
                .comment-action-btn.hover-danger:hover {
                    color: #ef4444 !important;
                    background: rgba(239,68,68,0.1);
                }
                .comment-action-btn.hover-accent:hover {
                    color: var(--accent) !important;
                    background: rgba(255, 255, 255, 0.05);
                }
                .comment-action-btn.hover-rose:hover {
                    color: #f43f5e !important;
                    background: rgba(244, 63, 94, 0.1);
                }
                .comment-action-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
};

export default CommentSection;
