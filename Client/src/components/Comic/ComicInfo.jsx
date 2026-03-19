import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Star, User, Calendar, Tag, Share2, Heart } from 'lucide-react';
import { formatViews } from '../../utils/format';
import LazyImage from '../LazyImage';

const ComicInfo = ({ comic }) => {
    const [userRating, setUserRating] = useState(0);
    const [avgRating, setAvgRating] = useState(comic.rating || 0);
    const [hoverRating, setHoverRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);
    const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
    const token = localStorage.getItem('token');
    
    useEffect(() => {
        if (token && comic) {
            fetch(`http://localhost:5000/api/comics/${comic.id || comic._id}/user-rating`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(res => res.json())
            .then(data => {
                if (data.rating) setUserRating(data.rating);
            })
            .catch(console.error);

            fetch(`http://localhost:5000/api/comics/${comic.id || comic._id}/favorite`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(res => res.json())
            .then(data => {
                if (data.isFavorited !== undefined) setIsFavorited(data.isFavorited);
            })
            .catch(console.error);
        }
    }, [comic, token]);

    const handleRate = async (value) => {
        if (!token) return alert('Vui lòng đăng nhập để đánh giá truyện');
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`http://localhost:5000/api/comics/${comic.id || comic._id}/rate`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ rating: value })
            });
            const data = await res.json();
            if (res.ok) {
                setUserRating(data.user_rating);
                setAvgRating(data.rating);
            } else {
                alert(data.message || 'Lỗi khi đánh giá');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFavorite = async () => {
        if (!token) return alert('Vui lòng đăng nhập để yêu thích truyện');
        if (isTogglingFavorite) return;
        setIsTogglingFavorite(true);
        try {
            const res = await fetch(`http://localhost:5000/api/comics/${comic.id || comic._id}/favorite`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setIsFavorited(data.isFavorited);
            } else {
                alert(data.message || 'Lỗi khi thao tác');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsTogglingFavorite(false);
        }
    };

    return (
        <div className="relative">
            {/* Banner Background */}
            <div className="info-banner-bg">
                <div className="info-banner-blur" style={{ backgroundImage: `url(${comic.cover_url || comic.cover})` }}></div>
                <div className="info-banner-overlay"></div>
            </div>

            <div className="container info-content-wrapper">
                {/* Cover Image */}
                <div className="info-cover-box">
                    <LazyImage
                        src={comic.cover_url || comic.cover}
                        alt={comic.title}
                        className="info-cover-img"
                    />
                </div>

                {/* Info Details */}
                <div className="info-text">
                    <h1 className="info-title">{comic.title}</h1>

                    <div className="info-stats">
                        <span className="flex items-center gap-4">
                            <User size={16} /> {comic.author}
                        </span>
                        <span className="flex items-center gap-1" style={{ cursor: token ? 'pointer' : 'default' }} title={token ? "Đánh giá truyện này" : "Đăng nhập để đánh giá"}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                    key={star} 
                                    size={18} 
                                    fill={(hoverRating || userRating) >= star ? "#eab308" : "transparent"} 
                                    color={(hoverRating || userRating) >= star ? "#eab308" : "var(--text-secondary)"}
                                    onMouseEnter={() => token && setHoverRating(star)}
                                    onMouseLeave={() => token && setHoverRating(0)}
                                    onClick={() => handleRate(star)}
                                    style={{ transition: 'all 0.2s', transform: hoverRating === star ? 'scale(1.2)' : 'none' }}
                                />
                            ))}
                            <span style={{ marginLeft: '4px', fontWeight: 'bold' }}>{Number(avgRating).toFixed(1)}</span>
                        </span>
                        <span className="flex items-center gap-4" style={{ color: '#22c55e' }}>
                            {comic.status}
                        </span>
                        <span>{formatViews(comic.views)} views</span>
                    </div>

                    <p className="info-desc">{comic.description}</p>

                    <div className="info-genres">
                        {comic.genres.map(genre => (
                            <span key={genre._id || genre} className="genre-tag">
                                {genre.name || genre}
                            </span>
                        ))}
                    </div>

                    <div className="info-actions">
                        <Link
                            to={comic.chapters && comic.chapters.length > 0 
                                ? `/read/${comic.id || comic._id}/${comic.chapters[0]._id || comic.chapters[0].id}`
                                : '#'
                            }
                            className="btn btn-primary"
                            onClick={(e) => {
                                if (!comic.chapters || comic.chapters.length === 0) {
                                    e.preventDefault();
                                    alert('No chapters available');
                                }
                            }}
                        >
                            <BookOpen size={20} />
                            Read First Chapter
                        </Link>
                        <button className="btn btn-glass" onClick={handleFavorite} style={{ color: isFavorited ? '#ef4444' : 'inherit' }}>
                            <Heart size={20} fill={isFavorited ? "#ef4444" : "none"} color={isFavorited ? "#ef4444" : "currentColor"} />
                            {isFavorited ? "Đã thích" : "Favorite"}
                        </button>
                        <button className="btn btn-glass">
                            <Share2 size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const ChapterList = ({ chapters, comicId }) => {
    return (
        <div className="container" style={{ marginTop: '3rem', paddingBottom: '2rem' }}>
            <h3 className="section-title" style={{ marginBottom: '1.5rem' }}>Chapters</h3>
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
                <div className="chapter-list-grid">
                    {chapters.map(chapter => (
                        <Link
                            key={chapter._id || chapter.id}
                            to={`/read/${comicId}/${chapter._id || chapter.id}`}
                            className="chapter-item"
                        >
                            <span className="chapter-title">{chapter.title}</span>
                            <span className="chapter-date">{chapter.date}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
export const CommentSection = ({ comicId, chapterId }) => {
    const [comments, setComments] = React.useState([]);
    const [newComment, setNewComment] = React.useState("");
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const token = localStorage.getItem('token');

    const fetchComments = () => {
        const url = `http://localhost:5000/api/comics/${comicId}/comments${chapterId ? `?chapterId=${chapterId}` : ''}`;
        fetch(url)
            .then(res => res.json())
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
            const res = await fetch(`http://localhost:5000/api/comics/${comicId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content: newComment, chapterId })
            });
            const data = await res.json();
            if (res.ok) {
                setNewComment("");
                fetchComments(); // Reload comments
            } else {
                alert(data.message || 'Lỗi khi gửi bình luận');
            }
        } catch (err) {
            console.error(err);
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
                                    {c.user_id?.avatar ? (
                                        <img src={c.user_id.avatar} alt="avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                            {c.user_id?.username ? c.user_id.username.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                    )}
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

export default ComicInfo;
