import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, Menu, X, Sun, Moon, Languages } from 'lucide-react';
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
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    
    const { user } = useAuthStore();
    const { t, language, toggleLanguage } = useTranslation();
    const { theme, toggleTheme } = useThemeStore();
    const mobileSearchRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (isMobileSearchOpen && mobileSearchRef.current) {
            setTimeout(() => mobileSearchRef.current?.focus(), 300);
        }
    }, [isMobileSearchOpen]);

    return (
        <>
            <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`} id="main-navbar">
                <div className="container navbar-content">
                    {/* Logo */}
                    <Link to="/" className="nav-logo">
                        Comic<span>Verse</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="nav-links hidden md:flex" id="desktop-nav-links">
                        <Link to="/" id="nav-home">{t('home')}</Link>
                        <Link to="/ranking" id="nav-ranking">{t('ranking')}</Link>
                        <Link to="/popular" id="nav-popular">{t('popular')}</Link>
                        <Link to="/genres" id="nav-genres">{t('genres')}</Link>
                        <Link to="/latest" id="nav-latest">{t('latest')}</Link>
                        {user && <Link to="/history" id="nav-history">{t('history')}</Link>}
                        {user && <Link to="/following" id="nav-following" style={{ color: '#eab308' }}>{t('following')}</Link>}
                    </div>

                    {/* Actions */}
                    <div className="nav-actions hidden md:flex">
                        {user?.role === 'creator' ? (
                            <Link to="/studio" className="hidden md:flex items-center justify-center px-3 py-1.5 text-[0.65rem] font-bold tracking-widest uppercase bg-[var(--accent)] hover:bg-orange-600 text-white rounded-lg transition-all border border-white/10 mr-2 whitespace-nowrap shadow-lg">
                                Studio
                            </Link>
                        ) : user?.role !== 'admin' ? (
                            <Link to="/become-creator" className="hidden md:flex items-center justify-center px-3 py-1.5 text-[0.65rem] font-bold tracking-widest uppercase bg-zinc-800/80 hover:bg-white text-white hover:text-black rounded-lg transition-all border border-white/10 mr-2 whitespace-nowrap shadow-lg">
                                Creator
                            </Link>
                        ) : null}
                        
                        <NavSearch />

                        <button className="theme-toggle-btn" onClick={toggleTheme} title={theme === 'dark' ? t('theme_light') : t('theme_dark')}>
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </button>

                        <button 
                            className="theme-toggle-btn ml-2" 
                            onClick={toggleLanguage} 
                            title={t('switch_lang')}
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0 8px' }}
                        >
                            <Languages size={18} />
                            <span style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>{language.toUpperCase()}</span>
                        </button>

                        <NavProfile />
                    </div>

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
                    <NavSearch onSearchComplete={() => setIsMobileSearchOpen(false)} />
                    <button
                        className="mobile-search-close"
                        onClick={() => setIsMobileSearchOpen(false)}
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
        </>
    );
};

export default Navbar;
