import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Eye, TrendingUp, Filter, ChevronDown, Flame } from 'lucide-react';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';

const PopularComicCard = ({ comic, rank }) => {
    return (
        <Link to={`/p/${comic.id || comic._id}`} className="popular-comic-card">
            <div className="popular-card-image-wrapper">
                <img
                    src={comic.cover_url || comic.cover}
                    alt={comic.title}
                    className="card-image"
                />

                {rank <= 3 && (
                    <div className={`popular-rank-badge rank-${rank}`}>
                        #{rank}
                    </div>
                )}
                {rank > 3 && (
                    <div className="popular-rank-badge">
                        #{rank}
                    </div>
                )}
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
                        <span>{comic.views || '0'}</span>
                    </div>
                </div>
                {comic.genres && comic.genres.length > 0 && (
                    <div className="popular-card-genres">
                        {comic.genres.slice(0, 2).map((g, i) => (
                            <span key={i} className="popular-card-genre-tag">{g}</span>
                        ))}
                    </div>
                )}
            </div>
        </Link>
    );
};

const SkeletonCard = () => (
    <div className="popular-skeleton-card">
        <div className="popular-skeleton-img shimmer"></div>
        <div className="popular-skeleton-title shimmer"></div>
        <div className="popular-skeleton-meta shimmer"></div>
    </div>
);

const PopularPage = () => {
    const [comics, setComics] = useState([]);
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedGenre, setSelectedGenre] = useState('');
    const [sortBy, setSortBy] = useState('views');
    const [showGenreDropdown, setShowGenreDropdown] = useState(false);

    useEffect(() => {
        fetchPopularComics();
    }, [selectedGenre, sortBy]);

    const fetchPopularComics = async () => {
        setLoading(true);
        try {
            let url = `http://localhost:5000/api/comics/popular?sort=${sortBy}`;
            if (selectedGenre) {
                url += `&genre=${encodeURIComponent(selectedGenre)}`;
            }
            const response = await fetch(url);
            const data = await response.json();
            setComics(data.comics || []);
            if (data.genres) setGenres(data.genres);
        } catch (error) {
            console.error('Error fetching popular comics:', error);
        } finally {
            setLoading(false);
        }
    };

    const sortOptions = [
        { value: 'views', label: 'Most Views', icon: <Eye size={14} /> },
        { value: 'rating', label: 'Highest Rated', icon: <Star size={14} /> },
        { value: 'newest', label: 'Newest First', icon: <TrendingUp size={14} /> },
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <Navbar />

            {/* Page Header */}
            <div className="popular-page-header">
                <div className="popular-header-bg"></div>
                <div className="popular-header-overlay"></div>
                <div className="container popular-header-content">
                    <h1 className="popular-header-title">Popular Comics</h1>
                    <p className="popular-header-desc">
                        Discover the most read and trending comics loved by our community
                    </p>
                    <div className="popular-header-stats">
                        <span className="popular-stat-pill">
                            <TrendingUp size={14} />
                            {comics.length} Comics
                        </span>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="container">
                <div className="popular-filter-bar glass-panel">
                    {/* Genre Filter */}
                    <div className="popular-filter-group">
                        <Filter size={16} style={{ color: 'var(--text-secondary)' }} />
                        <div className="popular-dropdown-wrapper">
                            <button
                                className="popular-dropdown-btn"
                                onClick={() => setShowGenreDropdown(!showGenreDropdown)}
                            >
                                <span>{selectedGenre || 'All Genres'}</span>
                                <ChevronDown size={14} />
                            </button>
                            {showGenreDropdown && (
                                <div className="popular-dropdown-menu">
                                    <button
                                        className={`popular-dropdown-item ${!selectedGenre ? 'active' : ''}`}
                                        onClick={() => { setSelectedGenre(''); setShowGenreDropdown(false); }}
                                    >
                                        All Genres
                                    </button>
                                    {genres.map(g => (
                                        <button
                                            key={g}
                                            className={`popular-dropdown-item ${selectedGenre === g ? 'active' : ''}`}
                                            onClick={() => { setSelectedGenre(g); setShowGenreDropdown(false); }}
                                        >
                                            {g}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sort Buttons */}
                    <div className="popular-sort-group">
                        {sortOptions.map(opt => (
                            <button
                                key={opt.value}
                                className={`popular-sort-btn ${sortBy === opt.value ? 'active' : ''}`}
                                onClick={() => setSortBy(opt.value)}
                            >
                                {opt.icon}
                                <span>{opt.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Comics Grid */}
            <div className="container" style={{ paddingBottom: '4rem' }}>
                {loading ? (
                    <div className="comic-grid" style={{ marginTop: '2rem' }}>
                        {Array.from({ length: 12 }).map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                ) : comics.length > 0 ? (
                    <div className="comic-grid" style={{ marginTop: '2rem' }}>
                        {comics.map((comic, index) => (
                            <PopularComicCard
                                key={comic._id || comic.id}
                                comic={comic}
                                rank={index + 1}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="popular-empty-state">
                        <Flame size={48} style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }} />
                        <h3>No comics found</h3>
                        <p>Try adjusting your filters to discover more comics.</p>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default PopularPage;
