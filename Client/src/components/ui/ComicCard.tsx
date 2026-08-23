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
        <Link to={`/p/${slugify(comic.title)}-${comic.id || comic._id}`} className="group flex flex-col gap-2.5 w-full select-none">
            {/* Double-Bezel Card Frame */}
            <div className="relative aspect-[2/3] w-full p-1 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] group-hover:border-[var(--accent)]/50 shadow-sm group-hover:shadow-xl group-hover:shadow-[var(--accent)]/10 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1.5">
                <div className="relative w-full h-full rounded-[calc(1rem-2px)] overflow-hidden bg-[var(--bg-card)]">
                    <LazyImage
                        src={comic.cover_url || comic.cover || ''}
                        alt={comic.title}
                        fill={true}
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                    {/* Subtle inner gradient shadow */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                    {/* Chapter count overlay badge */}
                    {showChapter && chapterCount > 0 && (
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-black text-white uppercase tracking-wider">
                            Ch. {chapterCount}
                        </div>
                    )}
                </div>
            </div>

            {/* Info details */}
            <div className="px-0.5 flex flex-col gap-1">
                <h3 className="font-bold text-xs sm:text-sm leading-snug line-clamp-1 text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors duration-300">
                    {comic.title}
                </h3>
                
                <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--text-secondary)]">
                    <div className="flex items-center gap-2">
                        <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                            <Star size={11} fill="currentColor" />
                            {displayRating}
                        </span>
                        <span className="text-[var(--text-muted)]">•</span>
                        <span className="flex items-center gap-1 opacity-80">
                            <Eye size={11} strokeWidth={2} />
                            {displayViews}
                        </span>
                    </div>

                    {showTime && comic.created_at && (
                        <span className="flex items-center gap-0.5 text-[10px] text-[var(--text-muted)]">
                            <Clock size={10} />
                            {timeAgo(comic.created_at)}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default ComicCard;
