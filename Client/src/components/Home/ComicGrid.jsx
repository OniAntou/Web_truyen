import React from 'react';
import { Link } from 'react-router-dom';
import ComicCard from '../ui/ComicCard';

const ComicGrid = ({ title, comics, linkTo = "/popular", showHoverStats = false }) => {
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
                    <ComicCard key={comic.id || comic._id} comic={comic} showHoverStats={showHoverStats} />
                ))}
            </div>
        </section>
    );
};

export default ComicGrid;
