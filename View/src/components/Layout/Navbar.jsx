import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Menu, X, User } from 'lucide-react';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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
                    <div className="relative group">
                        <button className="nav-icon-btn">
                            <Search size={22} />
                        </button>
                    </div>
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
                    <button className="btn btn-primary w-full" style={{ justifyContent: 'center' }}>Login</button>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
