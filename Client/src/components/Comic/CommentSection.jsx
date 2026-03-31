import React from 'react';
import { Link } from 'react-router-dom';
import { commentService } from '../../api/commentService';

const CommentSection = ({ comicId, chapterId }) => {
    const [comments, setComments] = React.useState([]);
    const [newComment, setNewComment] = React.useState("");
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const token = localStorage.getItem('token');

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
            fetchComments(); // Reload comments
        } catch (err) {
            console.error(err);
            alert(err || 'Lỗi khi gửi bình luận');
        } finally {
            setIsSubmitting(false);
        }
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
                        <div key={c._id} style={{ padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '0.75rem', border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                            {c.user_id?.username ? c.user_id.username.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <strong style={{ color: '#eab308', fontSize: '1.1rem' }}>{c.user_id?.username || 'Người dùng ẩn danh'}</strong>
                                </div>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    {new Date(c.created_at).toLocaleString('vi-VN')}
                                </span>
                            </div>
                            <p style={{ margin: 0, color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{c.content}</p>
                        </div>
                    )) : (
                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 0' }}>Chưa có bình luận nào. Hãy là người đầu tiên!</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommentSection;
