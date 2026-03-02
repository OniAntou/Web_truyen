import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Eye } from 'lucide-react';
import { formatViews } from '../../utils/format';

const ComicCard = ({ comic }) => {
    return (
        <Link to={`/p/${comic.id}`} className="comic-card">
            <div className="card-image-wrapper">
                <img
                    src={comic.cover_url || comic.cover}
                    alt={comic.title}
                    className="card-image"
                />

                {/* Overlay Tags */}
                <div className="card-tag">
                    {comic.chapters?.[0]?.title || 'New'}
                </div>
            </div>

            <div style={{ padding: '0 0.25rem' }}>
                <h3 className="card-title">
                    {comic.title}
                </h3>
                <div className="card-meta">
                    <div className="flex items-center" style={{ gap: '4px' }}>
                        <Star size={12} className="text-yellow-500" fill="#eab308" color="#eab308" />
                        <span>{comic.rating}</span>
                    </div>
                    <div className="flex items-center" style={{ gap: '4px' }}>
                        <Eye size={12} />
                        <span>{formatViews(comic.views)}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

const ComicGrid = ({ title, comics }) => {
    return (
        <section className="section">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">
                        {title}
                    </h2>
                    <Link to="/popular" className="view-all">View All</Link>
                </div>

                <div className="comic-grid">
                    {comics.map(comic => (
                        <ComicCard key={comic.id} comic={comic} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ComicGrid;
