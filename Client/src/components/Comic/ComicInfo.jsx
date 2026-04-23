import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Star, User, Calendar, Tag, Share2, Heart } from 'lucide-react';
import { formatViews, translateStatus } from '../../utils/format';
import LazyImage from '../ui/LazyImage';
import { comicService } from '../../api/comicService';
import { useQueryClient } from '@tanstack/react-query';

const ComicInfo = ({ comic }) => {
    const [userRating, setUserRating] = useState(0);
    const [avgRating, setAvgRating] = useState(comic.rating || 0);
    const [hoverRating, setHoverRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);
    const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
    const [readingProgress, setReadingProgress] = useState(null);
    const [loadingProgress, setLoadingProgress] = useState(true);
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;
    const queryClient = useQueryClient();
    
    useEffect(() => {
        if (user && comic) {
            const id = comic.id || comic._id;
            // Fetch user rating
            comicService.getUserRating(id)
            .then(data => {
                if (data.rating) setUserRating(data.rating);
            })
            .catch(console.error);

            // Fetch favorite status
            comicService.getFavoriteStatus(id)
            .then(data => {
                if (data.isFavorited !== undefined) setIsFavorited(data.isFavorited);
            })
            .catch(console.error);

            // Fetch reading progress
            comicService.getReadingProgress(id)
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
    }, [comic, user]);

    const handleRate = async (value) => {
        if (!user) return alert('Vui lòng đăng nhập để đánh giá truyện');
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            const data = await comicService.rate(comic.id || comic._id, value);
            setUserRating(data.user_rating);
            setAvgRating(data.rating);
            
            // OPTIMISTIC UPDATE: Manually update the home query cache for instant feedback
            const homeData = queryClient.getQueryData(['comics', 'home']);
            if (homeData) {
                const updatedHomeData = { ...homeData };
                const comicId = comic.id || comic._id;
                
                // Helper to update rating in a list
                const updateList = (list) => {
                    if (!list) return list;
                    return list.map(c => {
                        const cId = c.id || c._id;
                        // Use string comparison to handle Number vs ObjectId
                        if (String(cId) === String(comicId)) {
                            return { ...c, rating: data.rating };
                        }
                        return c;
                    });
                };

                updatedHomeData.popular = updateList(updatedHomeData.popular);
                updatedHomeData.latest = updateList(updatedHomeData.latest);
                updatedHomeData.trending = updateList(updatedHomeData.trending);

                queryClient.setQueryData(['comics', 'home', localStorage.getItem('home_data_version') || '1'], updatedHomeData);
            }

            // TRIGGER CACHE BUSTING: Update version to force a fresh fetch from server (bypassing CDN)
            const newVersion = Date.now().toString();
            localStorage.setItem('home_data_version', newVersion);

            // Invalidate home queries to trigger the refetch with the new URL
            queryClient.invalidateQueries({ queryKey: ['comics', 'home'] });
        } catch (err) {
            console.error(err);
            alert(err || 'Lỗi khi đánh giá');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFavorite = async () => {
        if (!user) return alert('Vui lòng đăng nhập để yêu thích truyện');
        if (isTogglingFavorite) return;
        setIsTogglingFavorite(true);
        try {
            const data = await comicService.toggleFavorite(comic.id || comic._id);
            setIsFavorited(data.isFavorited);
            
            // Invalidate home data if needed (if favorites affect listings)
            queryClient.invalidateQueries({ queryKey: ['comics', 'home'] });
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
                        <span className="flex items-center gap-1" style={{ cursor: user ? 'pointer' : 'default' }} title={user ? "Đánh giá truyện này" : "Đăng nhập để đánh giá"}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                    key={star} 
                                    size={18} 
                                    fill={(hoverRating || userRating) >= star ? "#eab308" : "transparent"} 
                                    color={(hoverRating || userRating) >= star ? "#eab308" : "var(--text-secondary)"}
                                    onMouseEnter={() => user && setHoverRating(star)}
                                    onMouseLeave={() => user && setHoverRating(0)}
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
                            <Link 
                                key={genre._id || genre} 
                                to={`/genres?type=${genre.name || genre}`} 
                                className="genre-tag"
                            >
                                {genre.name || genre}
                            </Link>
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
                                    alert('Chưa có chapter nào');
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
                                Đọc Tiếp - Chapter {readingProgress.chapter_number}
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
