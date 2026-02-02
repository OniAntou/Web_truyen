import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Star, User, Calendar, Tag, Share2, Heart } from 'lucide-react';

const ComicInfo = ({ comic }) => {
    return (
        <div className="relative">
            {/* Background Banner */}
            <div
                className="info-banner-bg"
                style={{ backgroundImage: `url(${comic.cover})` }}
            >
                <div className="info-banner-overlay"></div>
            </div>

            <div className="container info-content-wrapper">
                {/* Cover Image */}
                <div className="info-cover-box">
                    <img
                        src={comic.cover}
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
                        <span className="flex items-center gap-4">
                            <Star size={16} fill="#eab308" color="#eab308" /> {comic.rating}
                        </span>
                        <span className="flex items-center gap-4" style={{ color: '#22c55e' }}>
                            {comic.status}
                        </span>
                        <span>{comic.views} views</span>
                    </div>

                    <p className="info-desc">{comic.description}</p>

                    <div className="info-genres">
                        {comic.genres.map(genre => (
                            <span key={genre} className="genre-tag">
                                {genre}
                            </span>
                        ))}
                    </div>

                    <div className="info-actions">
                        <Link
                            to={`/read/${comic.id}`}
                            className="btn btn-primary"
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
                            key={chapter.id}
                            to={`/read/${comicId}`}
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
