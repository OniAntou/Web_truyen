import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Eye, Clock } from 'lucide-react';
import { formatViews, slugify } from '../../utils/format';
import LazyImage from './LazyImage';

import { Comic } from '../../types/comic';

interface ComicCardProps {
    comic: Comic;
    showTime?: boolean;
    showChapter?: boolean;
    showHoverStats?: boolean;
}

const ComicCard: React.FC<ComicCardProps> = ({ 
    comic, 
    showTime = false, 
    showChapter = true, 
    showHoverStats = false,
}) => {
    const timeAgo = (date: string | undefined): string => {
        if (!date) return '';
        const now = new Date();
        const d = new Date(date);
        const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
        if (diff < 60) return 'Vừa xong';
        if (diff < 3600) return `${Math.floor(diff / 60)} m`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} h`;
        if (diff < 604800) return `${Math.floor(diff / 86400)} d`;
        return d.toLocaleDateString('vi-VN', { month: '2-digit', day: '2-digit' });
    };

    const chapterCount = comic.chapter_count || (comic.chapters && comic.chapters.length) || 0;
    const displayRating = typeof comic.rating === 'number' ? comic.rating.toFixed(1) : (comic.rating || '0.0');
    const displayViews = formatViews(comic.views);

    return (
        <Link to={`/p/${slugify(comic.title)}-${comic.id || comic._id}`} className="group flex w-full flex-col gap-3 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--bg-primary)]">
            <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-[var(--bg-secondary)] shadow-sm ring-1 ring-[var(--border)] transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:shadow-[var(--shadow-card)]">
                <LazyImage
                    src={comic.cover_url || comic.cover || ''}
                    alt={comic.title}
                    fill={true}
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                {showHoverStats && (
                    <div className="pointer-events-none absolute inset-x-3 bottom-3 flex translate-y-2 items-center justify-between text-xs font-semibold text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        <span>{chapterCount > 0 ? `Chapter ${chapterCount}` : 'Đang cập nhật'}</span>
                        <span className="flex items-center gap-1"><Eye size={12} /> {displayViews}</span>
                    </div>
                )}
            </div>

            <div className="px-1 flex flex-col gap-1">
                <h3 className="font-bold text-[0.95rem] leading-tight line-clamp-1 transition-colors duration-300 ease-out group-hover:text-[var(--accent)]" style={{ color: 'var(--text-primary)' }}>
                    {comic.title}
                </h3>
                
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-[0.7rem] font-bold" style={{ color: '#fbbf24' }}>
                            <Star size={10} fill="currentColor" />
                            <span>{displayRating}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[0.7rem] font-semibold opacity-70" style={{ color: 'var(--text-secondary)' }}>
                            <Eye size={10} strokeWidth={2.5} />
                            <span>{displayViews}</span>
                        </div>
                        {showTime && comic.created_at && (
                            <div className="flex items-center gap-1 text-[0.7rem] font-semibold ml-auto opacity-60" style={{ color: 'var(--text-secondary)' }}>
                                <Clock size={10} strokeWidth={2.5} />
                                <span>{timeAgo(comic.created_at)}</span>
                            </div>
                        )}
                    </div>
                    
                    {showChapter && chapterCount > 0 && (
                        <p className="text-[0.65rem] uppercase font-bold tracking-widest line-clamp-1" style={{ color: 'var(--text-primary)' }}>
                            Chapter {chapterCount}
                        </p>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default ComicCard;
