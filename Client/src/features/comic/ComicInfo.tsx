import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Star, User as UserIcon, Share2, Heart, Eye, Sparkles } from 'lucide-react';
import { formatViews, translateStatus, slugify } from '../../utils/format';
import LazyImage from '../../components/ui/LazyImage';
import { comicService } from '../../services/comicService';
import { useQueryClient } from '@tanstack/react-query';
import { shareComic } from '../../utils/shareComic';
import { useAuthStore } from '../../store/authStore';

import { Comic } from '../../types/comic';
import type { ReadingProgress } from '../../types/comic';

interface ComicInfoProps {
    comic: Comic;
}

const ComicInfo: React.FC<ComicInfoProps> = ({ comic }) => {
    const [userRating, setUserRating] = useState(0);
    const [avgRating, setAvgRating] = useState<number | string>(comic.rating || 0);
    const [hoverRating, setHoverRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);
    const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
    const [readingProgress, setReadingProgress] = useState<ReadingProgress | null>(null);
    const [loadingProgress, setLoadingProgress] = useState(true);
    const [shareMessage, setShareMessage] = useState("");
    const user = useAuthStore(state => state.user);
    const queryClient = useQueryClient();
    
    useEffect(() => {
        if (user && comic) {
            const id = comic.id || comic._id;
            if (!id) return;

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

    const handleRate = async (value: number) => {
        if (!user) return alert('Vui lòng đăng nhập để đánh giá truyện');
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            const id = comic.id || comic._id;
            if (!id) throw new Error('Comic ID is missing');

            const data = await comicService.rate(id, value);
            setUserRating(data.user_rating);
            setAvgRating(data.rating);
            
            // OPTIMISTIC UPDATE
            const homeData = queryClient.getQueryData(['comics', 'home']) as { popular?: Comic[]; latest?: Comic[]; trending?: Comic[] } | undefined;
            if (homeData) {
                const updatedHomeData = { ...homeData };
                
                const updateList = (list: Comic[] | undefined) => {
                    if (!list) return list;
                    return list.map(c => {
                        const cId = c.id || c._id;
                        if (String(cId) === String(id)) {
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

            const newVersion = Date.now().toString();
            localStorage.setItem('home_data_version', newVersion);
            queryClient.invalidateQueries({ queryKey: ['comics', 'home'] });
        } catch (err: any) {
            console.error(err);
            alert(err?.message || 'Lỗi khi đánh giá');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFavorite = async () => {
        const id = comic.id || comic._id;
        if (!user) return alert('Vui lòng đăng nhập để yêu thích truyện');
        if (isTogglingFavorite || !id) return;
        setIsTogglingFavorite(true);
        try {
            const data = await comicService.toggleFavorite(id);
            setIsFavorited(data.isFavorited);
            queryClient.invalidateQueries({ queryKey: ['comics', 'home'] });
        } catch (err: any) {
            console.error(err);
            alert(err?.message || 'Lỗi khi thao tác');
        } finally {
            setIsTogglingFavorite(false);
        }
    };

    const handleShare = async () => {
        try {
            const result = await shareComic({
                title: comic.title,
                text: `Đọc ${comic.title} trên ComicVerse`,
                url: window.location.href,
            });
            if (result === "shared") {
                setShareMessage("Đã mở bảng chia sẻ.");
                return;
            }
            setShareMessage(result === "copied" ? "Đã sao chép liên kết truyện." : "Trình duyệt không hỗ trợ chia sẻ trực tiếp.");
        } catch (error) {
            if ((error as DOMException)?.name !== "AbortError") {
                setShareMessage("Không thể chia sẻ liên kết. Vui lòng thử lại.");
            }
        }
    };

    const comicId = comic.id || comic._id;

    return (
        <div className="relative overflow-hidden pt-24 sm:pt-32 pb-12 sm:pb-16 border-b border-[var(--border)]">
            {/* Cinematic Blurred Ambient Background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <img 
                    src={comic.cover_url || comic.cover || ''} 
                    className="w-full h-full object-cover blur-[100px] scale-125 opacity-25 dark:opacity-20"
                    alt="" 
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-primary)]/80 via-[var(--bg-primary)]/90 to-[var(--bg-primary)]" />
            </div>

            <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
                <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-start">
                    
                    {/* Double-Bezel Cover Image */}
                    <div className="w-full sm:w-72 md:w-80 shrink-0 mx-auto md:mx-0">
                        <div className="p-2 rounded-[2.2rem] bg-gradient-to-b from-white/15 to-white/5 border border-[var(--border)] shadow-2xl backdrop-blur-md">
                            <div className="aspect-[2/3] w-full rounded-[calc(2.2rem-0.5rem)] overflow-hidden bg-[var(--bg-card)] shadow-inner relative">
                                <LazyImage
                                    src={comic.cover_url || comic.cover || ''}
                                    alt={comic.title}
                                    fill={true}
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Comic Info Details */}
                    <div className="flex-1 min-w-0 space-y-6">
                        <div>
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">
                                    <Sparkles size={11} /> Truyện Chọn Lọc
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-secondary)]">
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: comic.status === 'Ongoing' ? '#22c55e' : '#a8a29e' }} />
                                    {translateStatus(comic.status || 'Ongoing')}
                                </span>
                            </div>

                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[var(--text-primary)] leading-[1.15]">
                                {comic.title}
                            </h1>
                        </div>

                        {/* Metadata Stats Pill Row */}
                        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-[var(--text-secondary)]">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                                <UserIcon size={14} className="text-[var(--text-muted)]" />
                                <span>{comic.author || 'Đang cập nhật'}</span>
                            </span>

                            {/* Interactive Rating */}
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]" role="group" aria-label={user ? "Đánh giá truyện này" : "Đăng nhập để đánh giá"}>
                                <div className="flex items-center gap-0.5">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            aria-label={`Đánh giá ${star} sao`}
                                            onMouseEnter={() => user && setHoverRating(star)}
                                            onMouseLeave={() => user && setHoverRating(0)}
                                            onFocus={() => user && setHoverRating(star)}
                                            onBlur={() => setHoverRating(0)}
                                            onClick={() => handleRate(star)}
                                            disabled={!user || isSubmitting}
                                            className="p-0.5 transition-transform hover:scale-125 focus:outline-none disabled:cursor-not-allowed"
                                        >
                                            <Star
                                                size={15}
                                                fill={(hoverRating || userRating) >= star ? "#fbbf24" : "transparent"}
                                                className={(hoverRating || userRating) >= star ? "text-amber-400" : "text-[var(--text-muted)]"}
                                            />
                                        </button>
                                    ))}
                                </div>
                                <span className="font-extrabold text-amber-400 ml-1">{Number(avgRating).toFixed(1)}</span>
                            </div>

                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                                <Eye size={14} className="text-[var(--accent)]" />
                                <span>{formatViews(comic.views)} lượt xem</span>
                            </span>
                        </div>

                        {/* Description */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                            <p className="text-sm sm:text-base leading-relaxed text-[var(--text-secondary)] whitespace-pre-line">
                                {comic.description || 'Chưa có tóm tắt cho bộ truyện này.'}
                            </p>
                        </div>

                        {/* Genre Tags */}
                        <div className="flex flex-wrap gap-2">
                            {comic.genres?.map((genre) => {
                                const genreName = typeof genre === 'string' ? genre : genre.name;
                                const genreId = typeof genre === 'string' ? genre : (genre._id || genre.name);
                                return (
                                    <Link 
                                        key={genreId} 
                                        to={`/genres?type=${genreName}`} 
                                        className="px-3.5 py-1 rounded-full text-xs font-bold bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-white hover:bg-[var(--accent)] border border-[var(--border)] hover:border-[var(--accent)] transition-all duration-300 shadow-sm"
                                    >
                                        #{genreName}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-3 pt-2">
                            <Link
                                to={comic.chapters && comic.chapters.length > 0 
                                    ? `/read/${slugify(comic.title)}-${comicId}/${comic.chapters[0]._id || comic.chapters[0].id}`
                                    : '#'
                                }
                                className="inline-flex items-center justify-center gap-2.5 px-7 py-3 rounded-full font-bold text-xs uppercase tracking-widest text-white bg-[var(--accent)] shadow-xl shadow-[var(--accent)]/25 hover:opacity-95 active:scale-95 transition-all"
                                onClick={(e) => {
                                    if (!comic.chapters || comic.chapters.length === 0) {
                                        e.preventDefault();
                                        alert('Truyện chưa có chương nào được phát hành');
                                    }
                                }}
                            >
                                <BookOpen size={16} />
                                <span>Đọc Từ Đầu</span>
                            </Link>

                            {readingProgress && !loadingProgress && (
                                <Link
                                    to={`/read/${slugify(comic.title)}-${comicId}/${readingProgress.chapter_id}`}
                                    className="inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest text-white bg-gradient-to-r from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/25 hover:opacity-95 active:scale-95 transition-all"
                                >
                                    <BookOpen size={16} />
                                    <span>Đọc Tiếp Ch. {readingProgress.chapter_number}</span>
                                </Link>
                            )}

                            <button 
                                className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full font-bold text-xs uppercase tracking-wider border transition-all active:scale-95 ${
                                    isFavorited 
                                        ? 'bg-rose-500/15 text-rose-500 border-rose-500/30' 
                                        : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border-[var(--border)] hover:bg-[var(--bg-elevated)]'
                                }`}
                                onClick={handleFavorite}
                            >
                                <Heart size={16} fill={isFavorited ? "currentColor" : "none"} />
                                <span>{isFavorited ? "Đã Theo Dõi" : "Theo Dõi"}</span>
                            </button>

                            <button 
                                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full font-bold text-xs uppercase tracking-wider bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border)] hover:bg-[var(--bg-elevated)] transition-all active:scale-95"
                                type="button" 
                                onClick={handleShare} 
                                aria-label={`Chia sẻ ${comic.title}`}
                            >
                                <Share2 size={16} />
                                <span>Chia Sẻ</span>
                            </button>
                            <p className="sr-only" role="status" aria-live="polite">{shareMessage}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComicInfo;
