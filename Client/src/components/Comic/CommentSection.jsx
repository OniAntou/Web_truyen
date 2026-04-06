import React from 'react';
import { Link } from 'react-router-dom';
import { commentService } from '../../api/commentService';

// Decode JWT to get user info (id, role)
const decodeToken = (token) => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload;
    } catch {
        return null;
    }
};

const CommentSection = ({ comicId, chapterId }) => {
    const [comments, setComments] = React.useState([]);
    const [newComment, setNewComment] = React.useState("");
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [deletingId, setDeletingId] = React.useState(null);
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
    }, [comicId, chapterId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        if (!token) return alert('Vui lòng đăng nhập để bình luận');
        
        setIsSubmitting(true);
        try {
            await commentService.create(comicId, newComment, chapterId, token);
            setNewComment("");
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
            setComments(prev => prev.filter(c => c._id !== commentId));
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

    return (
        <div className="container" style={{ marginTop: '1rem', paddingBottom: '3rem' }}>
            <h3 className="section-title" style={{ marginBottom: '1.5rem' }}>Bình luận</h3>
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
                {token ? (
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
                ) : (
                    <div style={{ padding: '1rem', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '0.5rem', marginBottom: '2rem', border: '1px solid var(--border)' }}>
                        <p style={{ color: 'var(--text-secondary)' }}>Vui lòng <Link to="/auth" style={{ color: '#eab308', textDecoration: 'none' }}>đăng nhập</Link> để tham gia bình luận.</p>
                    </div>
                )}

                <div className="comments-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {comments.length > 0 ? comments.map(c => (
                        <div key={c._id} style={{ 
                            padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '0.75rem', border: '1px solid var(--border)',
                            opacity: deletingId === c._id ? 0.5 : 1,
                            transition: 'opacity 0.2s'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                            {c.user_id?.username ? c.user_id.username.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <strong style={{ color: '#eab308', fontSize: '1.1rem' }}>{c.user_id?.username || 'Người dùng ẩn danh'}</strong>
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
                                            className="comment-delete-btn"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="3 6 5 6 21 6"></polyline>
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                            </svg>
                                            Xoá
                                        </button>
                                    )}
                                </div>
                            </div>
                            <p style={{ margin: 0, color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{c.content}</p>
                        </div>
                    )) : (
                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 0' }}>Chưa có bình luận nào. Hãy là người đầu tiên!</p>
                    )}
                </div>
            </div>

            <style>{`
                .comment-delete-btn {
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
                .comment-delete-btn:hover {
                    color: #ef4444 !important;
                    border-color: rgba(239,68,68,0.3) !important;
                    background: rgba(239,68,68,0.1) !important;
                }
                .comment-delete-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
};

export default CommentSection;
