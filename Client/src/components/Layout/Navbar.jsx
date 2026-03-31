import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, User, Star, Sun, Moon, Trash2 } from 'lucide-react';
import LazyImage from '../ui/LazyImage';
import { comicService } from '../../api/comicService';
import { userService } from '../../api/userService';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [searching, setSearching] = useState(false);
    const [user, setUser] = useState(null);
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'dark';
    });
    const searchRef = useRef(null);
    const profileRef = useRef(null);
    const debounceRef = useRef(null);
    const navigate = useNavigate();

    // Re-check authentication context
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try { setUser(JSON.parse(storedUser)); } catch(e) {}
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setShowProfileDropdown(false);
        navigate('/');
    };



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
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setShowProfileDropdown(false);
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
                const data = await comicService.getAll(value);
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
                    {user && <Link to="/following" style={{ color: '#eab308' }}>Following</Link>}
                </div>

                {/* Actions */}
                <div className="nav-actions flex items-center">
                    {(user?.role === 'creator' || user?.role === 'admin') ? (
                        <Link to="/studio" className="hidden md:flex items-center justify-center px-3 py-1.5 text-[0.65rem] font-bold tracking-widest uppercase bg-[var(--accent)] hover:bg-orange-600 text-white rounded-lg transition-all border border-white/10 mr-2 whitespace-nowrap shadow-lg">
                            Studio
                        </Link>
                    ) : (
                        <Link to="/become-creator" className="hidden md:flex items-center justify-center px-3 py-1.5 text-[0.65rem] font-bold tracking-widest uppercase bg-zinc-800/80 hover:bg-white text-white hover:text-black rounded-lg transition-all border border-white/10 mr-2 whitespace-nowrap shadow-lg">
                            Creator
                        </Link>
                    )}
                    <div className="nav-search-container flex-shrink-0" ref={searchRef}>
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
                                                <LazyImage
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
                                                            <span className="search-dropdown-genre">{comic.genres[0].name || comic.genres[0]}</span>
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

                    {user ? (
                        <div className="nav-profile" ref={profileRef} style={{ position: 'relative' }}>
                            <div 
                                style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', cursor: 'pointer', userSelect: 'none' }}
                                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                            >
                                {user.username ? user.username.charAt(0).toUpperCase() : <User size={18} />}
                            </div>
                            {showProfileDropdown && (
                                <div className="profile-dropdown" style={{ position: 'absolute', top: '120%', right: '0', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.5rem', minWidth: '180px', zIndex: 50, boxShadow: 'var(--shadow-card)' }}>
                                    <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)', marginBottom: '0.5rem' }}>
                                        <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{user.username}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
                                    </div>
                                    <Link to="/profile" style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.5rem', background: 'transparent', border: 'none', color: 'var(--text-primary)', textDecoration: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: '600', marginBottom: '0.25rem' }} onClick={() => setShowProfileDropdown(false)}>
                                        Trang cá nhân
                                    </Link>
                                    {user?.role === 'admin' && (
                                        <Link to="/admin" style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.5rem', background: 'transparent', border: 'none', color: '#3b82f6', textDecoration: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: '600', marginBottom: '0.25rem' }} onClick={() => setShowProfileDropdown(false)}>
                                            Admin Panel
                                        </Link>
                                    )}
                                    {(user?.role === 'creator' || user?.role === 'admin') && (
                                        <Link to="/studio" style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.5rem', background: 'transparent', border: 'none', color: 'var(--accent)', textDecoration: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: '600', marginBottom: '0.25rem' }} onClick={() => setShowProfileDropdown(false)}>
                                            Creator Studio
                                        </Link>
                                    )}
                                    <button onClick={handleLogout} style={{ width: '100%', textAlign: 'left', padding: '0.5rem', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', borderRadius: '4px', fontWeight: '600' }}>
                                        Đăng xuất
                                    </button>

                                </div>
                            )}
                        </div>
                    ) : (
                        <button className="btn btn-primary" onClick={() => navigate('/auth')}>
                            <User size={18} />
                            <span>Login</span>
                        </button>
                    )}
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
                    {user && <Link to="/following" onClick={() => setIsMobileMenuOpen(false)} style={{ color: '#eab308' }}>Following</Link>}
                    {(user?.role === 'creator' || user?.role === 'admin') ? (
                        <Link to="/studio" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'var(--accent)', fontWeight: 'bold' }}>Creator Studio</Link>
                    ) : (
                        <Link to="/become-creator" onClick={() => setIsMobileMenuOpen(false)} style={{ color: '#a855f7', fontWeight: 'bold' }}>Become Creator</Link>
                    )}
                    <div style={{ height: '1px', background: 'var(--border)' }}></div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Theme</span>
                        <button className="theme-toggle-btn" onClick={toggleTheme}>
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                    </div>
                    {user ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'var(--bg-primary)', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                                    {user.username ? user.username.charAt(0).toUpperCase() : <User size={18} />}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '0.9rem' }}>{user.username}</span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{user.email}</span>
                                </div>
                            </div>
                            <button className="btn w-full" style={{ justifyContent: 'center', background: 'var(--bg-secondary)', color: 'var(--text-primary)', marginBottom: '0.5rem', border: '1px solid var(--border)' }} onClick={() => { navigate('/profile'); setIsMobileMenuOpen(false); }}>Trang cá nhân</button>
                            <button className="btn w-full" style={{ justifyContent: 'center', background: '#3f3f46', color: '#ef4444' }} onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}>Đăng xuất</button>

                        </div>
                    ) : (
                        <button className="btn btn-primary w-full" style={{ justifyContent: 'center', marginTop: '1rem' }} onClick={() => { navigate('/auth'); setIsMobileMenuOpen(false); }}>Login</button>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
