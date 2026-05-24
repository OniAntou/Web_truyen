import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Sun, Moon } from 'lucide-react';
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

                    {/* Desktop Actions */}
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

                        <NavProfile />
                    </div>

                    {/* Mobile Actions */}
                    <div className="mobile-nav-actions md:hidden flex items-center gap-2">
                        <Link to="/search" className="mobile-nav-btn" aria-label="Search">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </Link>
                        <button
                            className="mobile-nav-btn"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label="Menu"
                        >
                            {isMobileMenuOpen ? <X size={22} strokeWidth={2.5} /> : <Menu size={22} strokeWidth={2.5} />}
                        </button>
                    </div>
                </div>
            </nav>



            <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
        </>
    );
};

export default Navbar;
