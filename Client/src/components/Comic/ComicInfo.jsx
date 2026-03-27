import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Star, User, Calendar, Tag, Share2, Heart } from 'lucide-react';
import { formatViews, translateStatus } from '../../utils/format';
import LazyImage from '../ui/LazyImage';
import { comicService } from '../../api/comicService';

const ComicInfo = ({ comic }) => {
    const [userRating, setUserRating] = useState(0);
    const [avgRating, setAvgRating] = useState(comic.rating || 0);
    const [hoverRating, setHoverRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);
    const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
    const [readingProgress, setReadingProgress] = useState(null);
    const [loadingProgress, setLoadingProgress] = useState(true);
    const token = localStorage.getItem('token');
    
    useEffect(() => {
        if (token && comic) {
            const id = comic.id || comic._id;
            // Fetch user rating
            comicService.getUserRating(id, token)
            .then(data => {
                if (data.rating) setUserRating(data.rating);
            })
            .catch(console.error);

            // Fetch favorite status
            comicService.getFavoriteStatus(id, token)
            .then(data => {
                if (data.isFavorited !== undefined) setIsFavorited(data.isFavorited);
            })
            .catch(console.error);

            // Fetch reading progress
            comicService.getReadingProgress(id, token)
            .then(data => {
                if (data.hasProgress) {
                    setReadingProgress(data);
                }
                setLoadingProgress(false);
            })
            .catch(err => {
                console.error('Error fetching reading progress:', err);
                setLoadingProgress(false);
            });
        } else {
            setLoadingProgress(false);
        }
    }, [comic, token]);

    const handleRate = async (value) => {
        if (!token) return alert('Vui lòng đăng nhập để đánh giá truyện');
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            const data = await comicService.rate(comic.id || comic._id, value, token);
            setUserRating(data.user_rating);
            setAvgRating(data.rating);
        } catch (err) {
            console.error(err);
            alert(err || 'Lỗi khi đánh giá');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFavorite = async () => {
        if (!token) return alert('Vui lòng đăng nhập để yêu thích truyện');
        if (isTogglingFavorite) return;
        setIsTogglingFavorite(true);
        try {
            const data = await comicService.toggleFavorite(comic.id || comic._id, token);
            setIsFavorited(data.isFavorited);
        } catch (err) {
            console.error(err);
            alert(err || 'Lỗi khi thao tác');
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
                            {translateStatus(comic.status)}
                        </span>
                        <span>{formatViews(comic.views)} lượt xem</span>
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
                                    alert('Chưa có chương nào');
                                }
                            }}
                        >
                            <BookOpen size={20} />
                            Đọc Từ Đầu
                        </Link>

                        {readingProgress && !loadingProgress && (
                            <Link
                                to={`/read/${comic.id || comic._id}/${readingProgress.chapter_id}`}
                                className="btn btn-secondary"
                                style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
                            >
                                <BookOpen size={20} />
                                Đọc Tiếp - Chương {readingProgress.chapter_number}
                            </Link>
                        )}
                        <button className="btn btn-glass" onClick={handleFavorite} style={{ color: isFavorited ? '#ef4444' : 'inherit' }}>
                            <Heart size={20} fill={isFavorited ? "#ef4444" : "none"} color={isFavorited ? "#ef4444" : "currentColor"} />
                            {isFavorited ? "Đã thích" : "Yêu thích"}
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

export default ComicInfo;
