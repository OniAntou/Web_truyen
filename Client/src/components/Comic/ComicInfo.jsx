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
                        <button className="btn btn-glass">
                            <Heart size={20} />
                            Favorite
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
export default ComicInfo;
