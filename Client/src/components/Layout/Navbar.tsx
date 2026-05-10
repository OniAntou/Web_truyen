import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, User as UserIcon, Star, Sun, Moon, Home, TrendingUp, Grid3X3, Clock, Heart, BookOpen, Shield, Palette } from 'lucide-react';
import LazyImage from '../ui/LazyImage';
import { comicService } from '../../api/comicService';
import { userService } from '../../api/userService';
import { clearReadingHistory } from '../../utils/readingHistory';
import { clearSession } from '../../utils/auth';

import { Comic, Genre } from '../../types/comic';
import { User } from '../../types/user';

const Navbar: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Comic[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [searching, setSearching] = useState(false);
    const [user, setUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem('user');
        try {
            return storedUser ? JSON.parse(storedUser) : null;
        } catch (e) {
            return null;
        }
    });
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'dark';
    });
    const searchRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);
    const mobileSearchRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<any>(null);
    const navigate = useNavigate();
    // Validate user session and check authentication
    useEffect(() => {
        const checkAuth = async (shouldVerifyWithServer = false) => {
            const storedUser = localStorage.getItem('user');

            if (storedUser) {
                // 1. Local sync
                setUser(JSON.parse(storedUser));
                
                // 2. Server validation (robust) - Only if explicitly requested or on mount
                if (shouldVerifyWithServer) {
                    try {
                        const latestUser = await userService.getMe();
                        setUser(latestUser as User);
                        localStorage.setItem('user', JSON.stringify(latestUser));
                    } catch (err) {
                        // If error (401/403), apiClient.js will call clearSession
                        // which triggers the 'auth:logout' event handled below
                    }
                }
            } else {
                setUser(null);
            }
        };

        // Initial check on mount
        checkAuth(true);

        // Check auth periodically and when user returns to tab
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                checkAuth(true);
            }
        };
        const handleFocus = () => checkAuth(true);
        const handleStorage = () => checkAuth(false);
        
        window.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);
        const authInterval = setInterval(() => checkAuth(false), 60000);

        // Listen for auth:logout events
        const handleLogoutEvent = () => {
            localStorage.removeItem('user');
            clearReadingHistory();
            setUser(null);
            setShowProfileDropdown(false);
            navigate('/auth');
        };
        window.addEventListener('auth:logout', handleLogoutEvent);
        window.addEventListener('storage', handleStorage);

        return () => {
            window.removeEventListener('auth:logout', handleLogoutEvent);
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
            clearInterval(authInterval);
        };
    }, [navigate]);

    const handleLogout = () => {
        clearSession();
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
        const handleClickOutside = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setShowProfileDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus mobile search input when opened
    useEffect(() => {
        if (isMobileSearchOpen && mobileSearchRef.current) {
            setTimeout(() => mobileSearchRef.current?.focus(), 300);
        }
    }, [isMobileSearchOpen]);

    // Lock body scroll when drawer is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isMobileMenuOpen]);

    // Debounced live search
    const handleSearchInput = (value: string) => {
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
                setSearchResults((data.comics || []).slice(0, 5));
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
            setIsMobileSearchOpen(false);
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    const navLinks = [
        { icon: <Home size={18} />, label: 'Trang Chủ', path: '/' },
        { icon: <TrendingUp size={18} />, label: 'Thịnh Hành', path: '/popular' },
        { icon: <Grid3X3 size={18} />, label: 'Thể Loại', path: '/genres' },
        { icon: <Clock size={18} />, label: 'Mới Nhất', path: '/latest' },
    ];

    const personalLinks = [
        { icon: <BookOpen size={18} />, label: 'Lịch Sử Đọc', path: '/history' },
        { icon: <Heart size={18} />, label: 'Đang Theo Dõi', path: '/following' },
        { icon: <UserIcon size={18} />, label: 'Trang Cá Nhân', path: '/profile' },
    ];

    return (
        <>
            <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`} id="main-navbar">
                <div className="container navbar-content">
                {/* Logo */}
                <div className="flex-1 flex justify-start">
                    <Link to="/" className="nav-logo">
                        Comic<span>Verse</span>
                    </Link>
                </div>

                {/* Desktop Menu */}
                <div className="nav-links flex-none flex justify-center hidden md:flex">
                    <Link to="/">Home</Link>
                    <Link to="/popular">Popular</Link>
                    <Link to="/genres">Genres</Link>
                    <Link to="/latest">Latest</Link>
                    {user && <Link to="/history">History</Link>}
                    {user && <Link to="/following" style={{ color: '#eab308' }}>Following</Link>}
                </div>

                {/* Actions */}
                <div className="nav-actions flex-1 flex items-center justify-end hidden md:flex">
                    {user?.role === 'creator' ? (
                        <Link to="/studio" className="hidden md:flex items-center justify-center px-3 py-1.5 text-[0.65rem] font-bold tracking-widest uppercase bg-[var(--accent)] hover:bg-orange-600 text-white rounded-lg transition-all border border-white/10 mr-2 whitespace-nowrap shadow-lg">
                            Studio
                        </Link>
                    ) : user?.role !== 'admin' ? (
                        <Link to="/become-creator" className="hidden md:flex items-center justify-center px-3 py-1.5 text-[0.65rem] font-bold tracking-widest uppercase bg-zinc-800/80 hover:bg-white text-white hover:text-black rounded-lg transition-all border border-white/10 mr-2 whitespace-nowrap shadow-lg">
                            Creator
                        </Link>
                    ) : null}
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
                                                    src={comic.cover_url || comic.cover || ''}
                                                    alt={comic.title}
                                                    className="search-dropdown-img"
                                                    style={{ width: '40px', height: '56px', flexShrink: 0 }}
                                                />
                                                <div className="search-dropdown-info">
                                                    <span className="search-dropdown-title">{comic.title}</span>
                                                    <div className="search-dropdown-meta">
                                                        {(comic.rating && Number(comic.rating) > 0) ? (
                                                            <span className="search-dropdown-rating">
                                                                <Star size={10} fill="#eab308" color="#eab308" />
                                                                {comic.rating}
                                                            </span>
                                                        ) : null}
                                                        {comic.genres && comic.genres.length > 0 && (
                                                            <span className="search-dropdown-genre">
                                                                {typeof comic.genres[0] === 'object' 
                                                                    ? (comic.genres[0] as Genre).name 
                                                                    : comic.genres[0]}
                                                            </span>
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
                                {user.username ? user.username.charAt(0).toUpperCase() : <UserIcon size={18} />}
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
                                    {user?.role === 'creator' && (
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
                            <UserIcon size={18} />
                            <span>Login</span>
                        </button>
                    )}
                </div>

                {/* Mobile Actions */}
                <div className="mobile-nav-actions">
                    <button
                        className="mobile-nav-btn"
                        onClick={() => setIsMobileSearchOpen(true)}
                        aria-label="Search"
                    >
                        <Search size={20} strokeWidth={2} />
                    </button>
                    <button
                        className="mobile-nav-btn"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Menu"
                    >
                        {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>
            </nav>

            {/* Mobile Search Overlay */}
            <div className={`mobile-search-overlay ${isMobileSearchOpen ? 'open' : ''}`}>
                <div className="mobile-search-bar">
                    <Search size={18} className="mobile-search-icon" />
                    <input
                        ref={mobileSearchRef}
                        type="text"
                        placeholder="Tìm kiếm truyện..."
                        value={searchQuery}
                        className="mobile-search-input"
                        onChange={(e) => handleSearchInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSearchSubmit();
                            if (e.key === 'Escape') setIsMobileSearchOpen(false);
                        }}
                    />
                    <button
                        className="mobile-search-close"
                        onClick={() => { setIsMobileSearchOpen(false); setSearchQuery(''); setSearchResults([]); setShowDropdown(false); }}
                    >
                        <X size={18} />
                    </button>
                </div>
                {/* Mobile search results */}
                {searchQuery && (
                    <div className="mobile-search-results">
                        {searching ? (
                            <div className="search-dropdown-loading">
                                <div className="search-spinner"></div>
                                <span>Đang tìm kiếm...</span>
                            </div>
                        ) : searchResults.length > 0 ? (
                            <>
                                {searchResults.map(comic => (
                                    <Link
                                        key={comic._id || comic.id}
                                        to={`/p/${comic._id || comic.id}`}
                                        className="search-dropdown-item"
                                        onClick={() => { setShowDropdown(false); setSearchQuery(''); setIsMobileSearchOpen(false); }}
                                    >
                                        <LazyImage
                                            src={comic.cover_url || comic.cover || ''}
                                            alt={comic.title}
                                            className="search-dropdown-img"
                                            style={{ width: '40px', height: '56px', flexShrink: 0 }}
                                        />
                                        <div className="search-dropdown-info">
                                            <span className="search-dropdown-title">{comic.title}</span>
                                            <div className="search-dropdown-meta">
                                                {(comic.rating && Number(comic.rating) > 0) ? (
                                                    <span className="search-dropdown-rating">
                                                        <Star size={10} fill="#eab308" color="#eab308" />
                                                        {comic.rating}
                                                    </span>
                                                ) : null}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                                <button className="search-dropdown-viewall" onClick={handleSearchSubmit}>
                                    Xem tất cả kết quả cho "{searchQuery}"
                                </button>
                            </>
                        ) : (
                            <div className="search-dropdown-empty">
                                Không tìm thấy kết quả cho "{searchQuery}"
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Mobile Menu Drawer */}
            <div className={`mobile-drawer-overlay ${isMobileMenuOpen ? 'open' : ''}`}>
                {/* Backdrop */}
                <div className="mobile-drawer-backdrop" onClick={closeMobileMenu} />
                
                {/* Drawer Content */}
                <div className={`mobile-drawer ${isMobileMenuOpen ? 'open' : ''}`}>
                    {/* Drawer Header */}
                    <div className="drawer-header">
                        <span className="nav-logo drawer-logo">Comic<span>Verse</span></span>
                        <button onClick={closeMobileMenu} className="drawer-close-btn">
                            <X size={20} />
                        </button>
                    </div>

                    {/* User Card */}
                    {user && (
                        <div className="drawer-user-card">
                            <div className="drawer-avatar">
                                {user.username ? user.username.charAt(0).toUpperCase() : <UserIcon size={20} />}
                            </div>
                            <div className="drawer-user-info">
                                <span className="drawer-username">{user.username}</span>
                                <span className="drawer-email">{user.email}</span>
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="drawer-nav-section">
                        <div className="drawer-section-label">Điều hướng</div>
                        <div className="drawer-nav-links">
                            {navLinks.map(link => (
                                <Link 
                                    key={link.path} 
                                    to={link.path} 
                                    className="drawer-nav-link" 
                                    onClick={closeMobileMenu}
                                >
                                    <span className="drawer-link-icon">{link.icon}</span>
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Personal */}
                    {user && (
                        <div className="drawer-nav-section">
                            <div className="drawer-section-label">Cá nhân</div>
                            <div className="drawer-nav-links">
                                {personalLinks.map(link => (
                                    <Link 
                                        key={link.path} 
                                        to={link.path} 
                                        className="drawer-nav-link" 
                                        onClick={closeMobileMenu}
                                    >
                                        <span className="drawer-link-icon">{link.icon}</span>
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* System */}
                    <div className="drawer-nav-section">
                        <div className="drawer-section-label">Hệ thống</div>
                        <div className="drawer-nav-links">
                            <button className="drawer-nav-link" onClick={toggleTheme}>
                                <span className="drawer-link-icon">
                                    <Palette size={18} />
                                </span>
                                Giao diện {theme === 'dark' ? 'Tối' : 'Sáng'}
                                <span className="drawer-link-badge">
                                    {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
                                </span>
                            </button>
                            {user?.role === 'creator' && (
                                <Link to="/studio" className="drawer-nav-link drawer-nav-accent" onClick={closeMobileMenu}>
                                    <span className="drawer-link-icon"><BookOpen size={18} /></span>
                                    Creator Studio
                                </Link>
                            )}
                            {user?.role === 'admin' && (
                                <Link to="/admin" className="drawer-nav-link drawer-nav-admin" onClick={closeMobileMenu}>
                                    <span className="drawer-link-icon"><Shield size={18} /></span>
                                    Admin Panel
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="drawer-footer">
                        {user ? (
                            <button className="drawer-logout-btn" onClick={() => { handleLogout(); closeMobileMenu(); }}>
                                Đăng Xuất
                            </button>
                        ) : (
                            <button className="drawer-login-btn" onClick={() => { navigate('/auth'); closeMobileMenu(); }}>
                                <UserIcon size={18} />
                                Đăng Nhập
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Navbar;
