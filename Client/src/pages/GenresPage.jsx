import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Eye, Grid3X3, BookOpen, Search, X } from 'lucide-react';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import { formatViews } from '../utils/format';

// Genre color mapping for visual variety
const genreThemes = {
    'Action':      { gradient: 'linear-gradient(135deg, #ef4444, #991b1b)' },
    'Adventure':   { gradient: 'linear-gradient(135deg, #f59e0b, #92400e)' },
    'Comedy':      { gradient: 'linear-gradient(135deg, #fbbf24, #b45309)' },
    'Drama':       { gradient: 'linear-gradient(135deg, #8b5cf6, #5b21b6)' },
    'Fantasy':     { gradient: 'linear-gradient(135deg, #a855f7, #6d28d9)' },
    'Horror':      { gradient: 'linear-gradient(135deg, #1f2937, #111827)' },
    'Mystery':     { gradient: 'linear-gradient(135deg, #6366f1, #3730a3)' },
    'Romance':     { gradient: 'linear-gradient(135deg, #ec4899, #9d174d)' },
    'Sci-Fi':      { gradient: 'linear-gradient(135deg, #06b6d4, #0e7490)' },
    'Slice of Life':{ gradient: 'linear-gradient(135deg, #f472b6, #be185d)' },
    'Sports':      { gradient: 'linear-gradient(135deg, #22c55e, #166534)' },
    'Supernatural':{ gradient: 'linear-gradient(135deg, #7c3aed, #4c1d95)' },
    'Thriller':    { gradient: 'linear-gradient(135deg, #dc2626, #7f1d1d)' },
    'Isekai':      { gradient: 'linear-gradient(135deg, #2dd4bf, #0f766e)' },
    'Martial Arts':{ gradient: 'linear-gradient(135deg, #f97316, #9a3412)' },
    'Mecha':       { gradient: 'linear-gradient(135deg, #64748b, #334155)' },
    'Historical':  { gradient: 'linear-gradient(135deg, #a16207, #713f12)' },
    'Psychological':{ gradient: 'linear-gradient(135deg, #e879f9, #86198f)' },
    'School':      { gradient: 'linear-gradient(135deg, #38bdf8, #0369a1)' },
    'Shounen':     { gradient: 'linear-gradient(135deg, #f43f5e, #e11d48)' },
    'Shoujo':      { gradient: 'linear-gradient(135deg, #fb7185, #be123c)' },
};

const defaultTheme = { gradient: 'linear-gradient(135deg, #64748b, #475569)' };

const getGenreTheme = (name) => {
    for (const [key, theme] of Object.entries(genreThemes)) {
        if (name.toLowerCase().includes(key.toLowerCase())) return theme;
    }
    return defaultTheme;
};

const GenreCard = ({ genre, isSelected, onClick }) => {
    const theme = getGenreTheme(genre.name);
    return (
        <button
            className={`genre-card ${isSelected ? 'selected' : ''}`}
            onClick={onClick}
            style={{ '--genre-gradient': theme.gradient }}
        >
            <div className="genre-card-info">
                <span className="genre-card-name">{genre.name}</span>
                <span className="genre-card-count">{genre.count} comics</span>
            </div>
            {isSelected && (
                <div className="genre-card-check">✓</div>
            )}
        </button>
    );
};

const ComicCard = ({ comic }) => (
    <Link to={`/p/${comic.id || comic._id}`} className="popular-comic-card">
        <div className="popular-card-image-wrapper">
            <img src={comic.cover_url || comic.cover} alt={comic.title} className="card-image" />

        </div>
        <div style={{ padding: '0 0.25rem' }}>
            <h3 className="card-title">{comic.title}</h3>
            <div className="card-meta">
                <div className="flex items-center" style={{ gap: '4px' }}>
                    <Star size={12} fill="#eab308" color="#eab308" />
                    <span>{comic.rating || '—'}</span>
                </div>
                <div className="flex items-center" style={{ gap: '4px' }}>
                    <Eye size={12} />
                    <span>{formatViews(comic.views)}</span>
                </div>
            </div>
        </div>
    </Link>
);

const SkeletonCard = () => (
    <div className="popular-skeleton-card">
        <div className="popular-skeleton-img shimmer"></div>
        <div className="popular-skeleton-title shimmer"></div>
        <div className="popular-skeleton-meta shimmer"></div>
    </div>
);

const GenresPage = () => {
    const [genres, setGenres] = useState([]);
    const [comics, setComics] = useState([]);
    const [selectedGenre, setSelectedGenre] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comicsLoading, setComicsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch all genres on mount
    useEffect(() => {
        fetch('http://localhost:5000/api/genres')
            .then(res => res.json())
            .then(data => {
                setGenres(data.genres || []);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching genres:', err);
                setLoading(false);
            });
    }, []);

    // Fetch comics when genre is selected
    useEffect(() => {
        if (!selectedGenre) {
            setComics([]);
            return;
        }
        setComicsLoading(true);
        fetch(`http://localhost:5000/api/genres?genre=${encodeURIComponent(selectedGenre)}`)
            .then(res => res.json())
            .then(data => {
                setComics(data.comics || []);
                setComicsLoading(false);
            })
            .catch(err => {
                console.error('Error fetching genre comics:', err);
                setComicsLoading(false);
            });
    }, [selectedGenre]);

    const filteredGenres = genres.filter(g =>
        g.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleGenreClick = (genreName) => {
        if (selectedGenre === genreName) {
            setSelectedGenre(null);
        } else {
            setSelectedGenre(genreName);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <Navbar />

            {/* Page Header */}
            <div className="genres-page-header">
                <div className="genres-header-bg"></div>
                <div className="genres-header-overlay"></div>
                <div className="container genres-header-content">
                    <h1 className="popular-header-title">Browse Genres</h1>
                    <p className="popular-header-desc">
                        Explore comics by genre — find exactly what you're in the mood for
                    </p>
                    <div className="popular-header-stats">
                        <span className="popular-stat-pill">
                            <BookOpen size={14} />
                            {genres.length} Genres
                        </span>
                    </div>
                </div>
            </div>

            <div className="container" style={{ position: 'relative', zIndex: 20 }}>
                {/* Genre Search */}
                <div className="genres-search-bar glass-panel">
                    <Search size={18} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                    <input
                        type="text"
                        placeholder="Search genres..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="genres-search-input"
                    />
                    {searchQuery && (
                        <button className="genres-search-clear" onClick={() => setSearchQuery('')}>
                            <X size={16} />
                        </button>
                    )}
                </div>

                {/* Genre Grid */}
                {loading ? (
                    <div className="genres-grid">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="genre-card-skeleton shimmer"></div>
                        ))}
                    </div>
                ) : (
                    <div className="genres-grid">
                        {filteredGenres.map(genre => (
                            <GenreCard
                                key={genre.name}
                                genre={genre}
                                isSelected={selectedGenre === genre.name}
                                onClick={() => handleGenreClick(genre.name)}
                            />
                        ))}
                        {filteredGenres.length === 0 && (
                            <div className="genres-empty" style={{ gridColumn: '1 / -1' }}>
                                <p>No genres matching "{searchQuery}"</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Selected Genre Comics */}
                {selectedGenre && (
                    <div className="genres-comics-section">
                        <div className="genres-comics-header">
                            <h2 className="section-title">
                                {selectedGenre}
                            </h2>
                            <button
                                className="genres-clear-btn"
                                onClick={() => setSelectedGenre(null)}
                            >
                                <X size={14} />
                                <span>Clear</span>
                            </button>
                        </div>

                        {comicsLoading ? (
                            <div className="comic-grid">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <SkeletonCard key={i} />
                                ))}
                            </div>
                        ) : comics.length > 0 ? (
                            <div className="comic-grid">
                                {comics.map(comic => (
                                    <ComicCard key={comic._id || comic.id} comic={comic} />
                                ))}
                            </div>
                        ) : (
                            <div className="popular-empty-state" style={{ padding: '3rem 1rem' }}>
                                <p>No comics found in this genre.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div style={{ paddingTop: '3rem' }}>
                <Footer />
            </div>
        </div>
    );
};

export default GenresPage;
