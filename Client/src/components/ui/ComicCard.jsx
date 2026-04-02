import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Eye, Clock } from 'lucide-react';
import { formatViews } from '../../utils/format';
import LazyImage from './LazyImage';

const ComicCard = ({ comic, showTime = false, showChapter = true, showHoverStats = false }) => {
    const timeAgo = (date) => {
        if (!date) return '';
        const now = new Date();
        const d = new Date(date);
        const diff = Math.floor((now - d) / 1000);
        if (diff < 60) return 'Vừa xong';
        if (diff < 3600) return `${Math.floor(diff / 60)} m`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} h`;
        if (diff < 604800) return `${Math.floor(diff / 86400)} d`;
        return d.toLocaleDateString('vi-VN', { month: '2-digit', day: '2-digit' });
    };

    const chapterCount = comic.chapter_count || (comic.chapters && comic.chapters.length);
    const displayRating = typeof comic.rating === 'number' ? comic.rating.toFixed(1) : (comic.rating || '0.0');
    const displayViews = formatViews(comic.views);

    return (
        <Link to={`/p/${comic.id || comic._id}`} className="group flex flex-col gap-3 w-full">
            <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden shadow-sm transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-[var(--shadow-card)] ring-1 ring-[var(--border)] bg-[var(--bg-secondary)]">
                <LazyImage
                    src={comic.cover_url || comic.cover}
                    alt={comic.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Chapter Badge Overlay */}
                {showChapter && chapterCount > 0 && (
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[0.65rem] font-bold tracking-widest uppercase backdrop-blur-md bg-black/60 text-white border border-white/10 shadow-lg pointer-events-none z-10">
                        Ch. {chapterCount}
                    </div>
                )}
                
                {/* Visual Feedback on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                {showHoverStats && (
                    <div className="absolute inset-x-0 bottom-0 p-3 flex items-center justify-between gap-3 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none z-10">
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/70 text-[0.7rem] font-bold text-yellow-300 border border-white/10 backdrop-blur-md shadow-lg">
                            <Star size={11} fill="currentColor" />
                            <span>{displayRating}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/70 text-[0.7rem] font-semibold text-white/90 border border-white/10 backdrop-blur-md shadow-lg">
                            <Eye size={11} strokeWidth={2.5} />
                            <span>{displayViews}</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="px-1 flex flex-col gap-1">
                <h3 className="font-bold text-[0.95rem] leading-tight line-clamp-1 transition-colors group-hover:text-[var(--accent)]" style={{ color: 'var(--text-primary)' }}>
                    {comic.title}
                </h3>
                
                <div className="flex flex-col gap-1.5">
                    {/* Stats Row (Always Visible) */}
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
                    
                    {/* Genres Row */}
                    {comic.genres && comic.genres.length > 0 && (
                        <p className="text-[0.65rem] uppercase font-bold tracking-widest line-clamp-1" style={{ color: 'var(--accent)', opacity: 0.8 }}>
                            {comic.genres.map(g => (typeof g === 'object' ? g.name : g)).join(' • ')}
                        </p>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default ComicCard;
