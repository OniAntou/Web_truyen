import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, User, Star, Sun, Moon } from 'lucide-react';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [searching, setSearching] = useState(false);
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'dark';
    });
    const searchRef = useRef(null);
    const debounceRef = useRef(null);
    const navigate = useNavigate();

    // Apply theme on mount and change
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounced live search
    const handleSearchInput = (value) => {
        setSearchQuery(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (!value.trim()) {
            setSearchResults([]);
            setShowDropdown(false);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            setSearching(true);
            try {
                const res = await fetch(`http://localhost:5000/api/comics?q=${encodeURIComponent(value)}`);
                const data = await res.json();
                setSearchResults(data.slice(0, 5));
                setShowDropdown(true);
            } catch (err) {
                console.error('Search error:', err);
            } finally {
                setSearching(false);
            }
        }, 300);
    };

    const handleSearchSubmit = () => {
        if (searchQuery.trim()) {
            setShowDropdown(false);
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    return (
        <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
            <div className="container navbar-content">
                {/* Logo */}
                <Link to="/" className="nav-logo">
                    Comic<span>Verse</span>
                </Link>

                {/* Desktop Menu */}
                <div className="nav-links">
                    <Link to="/">Home</Link>
                    <Link to="/popular">Popular</Link>
                    <Link to="/genres">Genres</Link>
                    <Link to="/latest">Latest</Link>
                </div>

                {/* Actions */}
                <div className="nav-actions">
                    <div className="nav-search-container" ref={searchRef}>
                        <div className="nav-search-box">
                            <Search size={18} className="nav-search-icon" />
                            <input 
                                type="text" 
                                placeholder="Search..." 
                                value={searchQuery}
                                className="nav-search-input"
                                onChange={(e) => handleSearchInput(e.target.value)}
                                onFocus={() => {
                                    if (searchResults.length > 0) setShowDropdown(true);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSearchSubmit();
                                    if (e.key === 'Escape') setShowDropdown(false);
                                }}
                            />
                            {searchQuery && (
                                <button
                                    className="nav-search-clear"
                                    onClick={() => { setSearchQuery(''); setSearchResults([]); setShowDropdown(false); }}
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        {/* Search Dropdown */}
                        {showDropdown && (
                            <div className="search-dropdown">
                                {searching ? (
                                    <div className="search-dropdown-loading">
                                        <div className="search-spinner"></div>
                                        <span>Searching...</span>
                                    </div>
                                ) : searchResults.length > 0 ? (
                                    <>
                                        {searchResults.map(comic => (
                                            <Link
                                                key={comic._id || comic.id}
                                                to={`/p/${comic._id || comic.id}`}
                                                className="search-dropdown-item"
                                                onClick={() => { setShowDropdown(false); setSearchQuery(''); }}
                                            >
                                                <img
                                                    src={comic.cover_url || comic.cover}
                                                    alt={comic.title}
                                                    className="search-dropdown-img"
                                                />
                                                <div className="search-dropdown-info">
                                                    <span className="search-dropdown-title">{comic.title}</span>
                                                    <div className="search-dropdown-meta">
                                                        {comic.rating && (
                                                            <span className="search-dropdown-rating">
                                                                <Star size={10} fill="#eab308" color="#eab308" />
                                                                {comic.rating}
                                                            </span>
                                                        )}
                                                        {comic.genres && comic.genres.length > 0 && (
                                                            <span className="search-dropdown-genre">{comic.genres[0]}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                        <button
                                            className="search-dropdown-viewall"
                                            onClick={handleSearchSubmit}
                                        >
                                            View all results for "{searchQuery}"
                                        </button>
                                    </>
                                ) : (
                                    <div className="search-dropdown-empty">
                                        No results found for "{searchQuery}"
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Theme Toggle */}
                    <button className="theme-toggle-btn" onClick={toggleTheme} title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>

                    <button className="btn btn-primary">
                        <User size={18} />
                        <span>Login</span>
                    </button>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="mobile-menu-toggle"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="mobile-menu-overlay">
                    <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
                    <Link to="/popular" onClick={() => setIsMobileMenuOpen(false)}>Popular</Link>
                    <Link to="/genres" onClick={() => setIsMobileMenuOpen(false)}>Genres</Link>
                    <Link to="/latest" onClick={() => setIsMobileMenuOpen(false)}>Latest</Link>
                    <div style={{ height: '1px', background: 'var(--border)' }}></div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Theme</span>
                        <button className="theme-toggle-btn" onClick={toggleTheme}>
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                    </div>
                    <button className="btn btn-primary w-full" style={{ justifyContent: 'center' }}>Login</button>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
