import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { useTranslation } from '../hooks/useTranslation';

// Sub-components
import NavSearch from './NavSearch';
import NavProfile from './NavProfile';
import MobileMenu from './MobileMenu';

const Navbar: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    
    const { user } = useAuthStore();
    const { t } = useTranslation();
    const { theme, toggleTheme } = useThemeStore();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { path: '/', label: t('home') },
        { path: '/ranking', label: t('ranking') },
        { path: '/popular', label: t('popular') },
        { path: '/genres', label: t('genres') },
        { path: '/latest', label: t('latest') },
    ];

    const isCurrentPath = (path: string) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 pointer-events-none">
                <div className="container mx-auto px-4 sm:px-6 max-w-7xl pt-3.5 sm:pt-4">
                    <nav 
                        className={`pointer-events-auto flex items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3 rounded-full transition-all duration-500 ${
                            isScrolled 
                                ? 'bg-[var(--glass-bg)] backdrop-blur-2xl border border-[var(--glass-border)] shadow-xl shadow-black/10' 
                                : 'bg-[var(--bg-secondary)]/60 backdrop-blur-md border border-[var(--border)]'
                        }`}
                        id="main-navbar"
                    >
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-1.5 group select-none">
                            <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[var(--accent)] to-rose-400 flex items-center justify-center text-white font-black text-sm shadow-md shadow-[var(--accent)]/20 group-hover:scale-105 transition-transform">
                                C
                            </span>
                            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[var(--text-primary)]">
                                Comic<span className="text-[var(--accent)]">Verse</span>
                            </span>
                        </Link>

                        {/* Desktop Navigation Links */}
                        <div className="hidden lg:flex items-center gap-1 bg-[var(--bg-primary)]/40 p-1 rounded-full border border-[var(--border)]">
                            {navItems.map((item) => {
                                const active = isCurrentPath(item.path);
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`relative px-4 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all duration-300 ${
                                            active
                                                ? 'text-white bg-[var(--accent)] shadow-sm shadow-[var(--accent)]/30'
                                                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                                        }`}
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
                            {user && (
                                <Link
                                    to="/history"
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all duration-300 ${
                                        isCurrentPath('/history')
                                            ? 'text-white bg-[var(--accent)] shadow-sm'
                                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                                    }`}
                                >
                                    {t('history')}
                                </Link>
                            )}
                            {user && (
                                <Link
                                    to="/following"
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all duration-300 ${
                                        isCurrentPath('/following')
                                            ? 'text-amber-300 bg-amber-500/20 border border-amber-500/30'
                                            : 'text-amber-400/80 hover:text-amber-400 hover:bg-amber-400/10'
                                    }`}
                                >
                                    {t('following')}
                                </Link>
                            )}
                        </div>

                        {/* Desktop Actions */}
                        <div className="hidden md:flex items-center gap-2.5">
                            {user?.role === 'creator' ? (
                                <Link 
                                    to="/studio" 
                                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase text-white bg-gradient-to-r from-rose-500 to-orange-500 hover:opacity-90 shadow-md shadow-rose-500/20 active:scale-95 transition-all"
                                >
                                    <Sparkles size={13} />
                                    <span>Studio</span>
                                </Link>
                            ) : user?.role !== 'admin' ? (
                                <Link 
                                    to="/become-creator" 
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-elevated)] border border-[var(--border)] transition-all"
                                >
                                    <span>Creator</span>
                                </Link>
                            ) : null}
                            
                            <NavSearch />

                            {/* Theme Toggle Button */}
                            <button
                                className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-elevated)] border border-[var(--border)] transition-all active:scale-95 focus:outline-none"
                                onClick={toggleTheme}
                                title={theme === 'dark' ? t('theme_light') : t('theme_dark')}
                                aria-label={theme === 'dark' ? t('theme_light') : t('theme_dark')}
                                aria-pressed={theme === 'dark'}
                            >
                                {theme === 'dark' ? (
                                    <Sun size={17} className="text-amber-400 animate-spin-slow" />
                                ) : (
                                    <Moon size={17} className="text-indigo-500" />
                                )}
                            </button>

                            <NavProfile />
                        </div>

                        {/* Mobile Actions */}
                        <div className="md:hidden flex items-center gap-2">
                            <button
                                className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-secondary)] bg-[var(--bg-secondary)] border border-[var(--border)]"
                                onClick={toggleTheme}
                                aria-label="Đổi theme"
                            >
                                {theme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
                            </button>
                            <Link 
                                to="/search" 
                                className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-secondary)] bg-[var(--bg-secondary)] border border-[var(--border)]" 
                                aria-label="Tìm kiếm"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            </Link>
                            <button
                                className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-primary)] bg-[var(--accent)] text-white shadow-md shadow-[var(--accent)]/20"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                aria-label={isMobileMenuOpen ? "Đóng menu" : "Mở menu"}
                                aria-expanded={isMobileMenuOpen}
                                aria-controls="mobile-navigation"
                            >
                                {isMobileMenuOpen ? <X size={18} strokeWidth={2.5} /> : <Menu size={18} strokeWidth={2.5} />}
                            </button>
                        </div>
                    </nav>
                </div>
            </header>

            <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
        </>
    );
};

export default Navbar;
