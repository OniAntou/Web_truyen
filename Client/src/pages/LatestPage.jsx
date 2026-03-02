import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Eye, Clock, Filter, ChevronDown, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import { formatViews } from '../utils/format';

const LatestComicCard = ({ comic }) => {
    const timeAgo = (date) => {
        if (!date) return '';
        const now = new Date();
        const d = new Date(date);
        const diff = Math.floor((now - d) / 1000);
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <Link to={`/p/${comic.id || comic._id}`} className="latest-comic-card">
            <div className="latest-card-image-wrapper">
                <img
                    src={comic.cover_url || comic.cover}
                    alt={comic.title}
                    className="card-image"
                />

                <div className="latest-time-badge">
                    <Clock size={10} />
                    <span>{timeAgo(comic.created_at)}</span>
                </div>
                {comic.chapter_count > 0 && (
                    <div className="latest-chapter-badge">
                        Ch. {comic.chapter_count}
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
                        <span>{formatViews(comic.views)}</span>
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

const LatestPage = () => {
    const [comics, setComics] = useState([]);
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedGenre, setSelectedGenre] = useState('');
    const [showGenreDropdown, setShowGenreDropdown] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

    useEffect(() => {
        fetchLatestComics(1);
    }, [selectedGenre]);

    const fetchLatestComics = async (page) => {
        setLoading(true);
        try {
            let url = `http://localhost:5000/api/comics/latest?page=${page}&limit=18`;
            if (selectedGenre) {
                url += `&genre=${encodeURIComponent(selectedGenre)}`;
            }
            const response = await fetch(url);
            const data = await response.json();
            setComics(data.comics || []);
            if (data.genres) setGenres(data.genres);
            if (data.pagination) setPagination(data.pagination);
        } catch (error) {
            console.error('Error fetching latest comics:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > pagination.totalPages) return;
        fetchLatestComics(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <Navbar />

            {/* Page Header */}
            <div className="latest-page-header">
                <div className="latest-header-bg"></div>
                <div className="latest-header-overlay"></div>
                <div className="container popular-header-content">
                    <h1 className="popular-header-title">Latest Updates</h1>
                    <p className="popular-header-desc">
                        Stay up to date with the freshest comics added to our library
                    </p>
                    <div className="popular-header-stats">
                        <span className="popular-stat-pill">
                            <Clock size={14} />
                            {pagination.total} Comics
                        </span>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="container">
                <div className="popular-filter-bar glass-panel">
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

                    {/* Page indicator */}
                    <div className="latest-page-indicator">
                        Page {pagination.page} of {pagination.totalPages}
                    </div>
                </div>
            </div>

            {/* Comics Grid */}
            <div className="container" style={{ paddingBottom: '2rem' }}>
                {loading ? (
                    <div className="comic-grid" style={{ marginTop: '2rem' }}>
                        {Array.from({ length: 12 }).map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                ) : comics.length > 0 ? (
                    <div className="comic-grid" style={{ marginTop: '2rem' }}>
                        {comics.map(comic => (
                            <LatestComicCard key={comic._id || comic.id} comic={comic} />
                        ))}
                    </div>
                ) : (
                    <div className="popular-empty-state">
                        <Clock size={48} style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }} />
                        <h3>No comics found</h3>
                        <p>Try adjusting your filters to discover more comics.</p>
                    </div>
                )}

                {/* Pagination */}
                {!loading && pagination.totalPages > 1 && (
                    <div className="latest-pagination">
                        <button
                            className="latest-page-btn"
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page <= 1}
                        >
                            <ChevronLeft size={18} />
                        </button>

                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                            .filter(p => {
                                const current = pagination.page;
                                return p === 1 || p === pagination.totalPages ||
                                    (p >= current - 2 && p <= current + 2);
                            })
                            .map((p, idx, arr) => (
                                <React.Fragment key={p}>
                                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                                        <span className="latest-page-dots">...</span>
                                    )}
                                    <button
                                        className={`latest-page-btn ${pagination.page === p ? 'active' : ''}`}
                                        onClick={() => handlePageChange(p)}
                                    >
                                        {p}
                                    </button>
                                </React.Fragment>
                            ))}

                        <button
                            className="latest-page-btn"
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page >= pagination.totalPages}
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default LatestPage;
