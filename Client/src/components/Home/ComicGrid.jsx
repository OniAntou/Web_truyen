import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Eye } from 'lucide-react';
import { formatViews } from '../../utils/format';
import LazyImage from '../LazyImage';

const ComicCard = ({ comic }) => {
    return (
        <Link to={`/p/${comic.id || comic._id}`} className="group flex flex-col gap-3">
            <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden shadow-sm transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-[var(--shadow-card)] ring-1 ring-[var(--border)] bg-[var(--bg-secondary)]">
                <LazyImage
                    src={comic.cover_url || comic.cover}
                    alt={comic.title}
                    className="w-full h-full object-cover"
                />
                
                {/* Floating Tag Badge */}
                <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full text-[0.65rem] font-bold tracking-widest uppercase backdrop-blur-md bg-black/60 text-white border border-white/10 shadow-lg">
                    {comic.chapters?.[0]?.title || 'Mới'}
                </div>
                
                {/* Meta overlay gradient (visible on hover) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <div className="flex gap-4 text-white text-xs font-semibold">
                        <span className="flex items-center gap-1.5"><Eye size={12}/>{formatViews(comic.views)}</span>
                        <span className="flex items-center gap-1.5 text-yellow-500"><Star size={12} fill="currentColor"/>{comic.rating || '—'}</span>
                    </div>
                </div>
            </div>
            <div className="px-1" style={{ paddingBottom: '2px' }}>
                <h3 className="font-bold text-[0.95rem] transition-colors group-hover:text-[var(--accent)]" style={{ 
                    color: 'var(--text-primary)',
                    lineHeight: '1.6',
                    overflow: 'visible',
                    minHeight: '1.4em',
                    paddingBottom: '4px',
                    textRendering: 'optimizeLegibility',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale'
                }}>{comic.title}</h3>
                {comic.genres && comic.genres.length > 0 && (
                    <p className="text-[0.65rem] uppercase font-semibold tracking-widest mt-1.5 line-clamp-1" style={{ color: 'var(--text-secondary)' }}>
                        {comic.genres.map(g => g.name || g).join(' • ')}
                    </p>
                )}
            </div>
        </Link>
    );
};

const ComicGrid = ({ title, comics, linkTo = "/popular" }) => {
    // Show only standard amount for grids
    const displayComics = comics.slice(0, 12);
    
    return (
        <section className="container mx-auto px-6 py-12 md:py-16 max-w-7xl">
            <div className="flex items-end justify-between mb-8 md:mb-10">
                <h2 className="text-3xl md:text-4xl font-light tracking-tight" style={{ color: 'var(--text-primary)' }}>
                    {title}
                </h2>
                <Link to={linkTo} className="text-xs font-bold tracking-widest uppercase transition-colors hover:opacity-80 pb-1 border-b-2" style={{ color: 'var(--accent)', borderColor: 'var(--accent)' }}>
                    Xem Tất Cả
                </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 md:gap-x-6 md:gap-y-10">
                {displayComics.map(comic => (
                    <ComicCard key={comic.id || comic._id} comic={comic} />
                ))}
            </div>
        </section>
    );
};

export default ComicGrid;
