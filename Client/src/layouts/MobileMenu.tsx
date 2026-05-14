import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, User as UserIcon, Home, Trophy, TrendingUp, Grid3X3, Clock, BookOpen, Heart, Palette, Shield, Moon, Sun } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from '../hooks/useTranslation';
import { useThemeStore } from '../store/themeStore';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
    const { user, logout: storeLogout } = useAuthStore();
    const { t } = useTranslation();
    const { theme, toggleTheme } = useThemeStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const handleLogout = () => {
        storeLogout();
        onClose();
        navigate('/');
    };

    const navLinks = [
        { icon: <Home size={18} />, label: t('home'), path: '/' },
        { icon: <Trophy size={18} />, label: t('ranking'), path: '/ranking' },
        { icon: <TrendingUp size={18} />, label: t('popular'), path: '/popular' },
        { icon: <Grid3X3 size={18} />, label: t('genres'), path: '/genres' },
        { icon: <Clock size={18} />, label: t('latest'), path: '/latest' },
    ];

    const personalLinks = [
        { icon: <BookOpen size={18} />, label: t('history'), path: '/history' },
        { icon: <Heart size={18} />, label: t('following'), path: '/following' },
        { icon: <UserIcon size={18} />, label: t('profile'), path: '/profile' },
    ];

    return (
        <div className={`mobile-drawer-overlay ${isOpen ? 'open' : ''}`}>
            <div className="mobile-drawer-backdrop" onClick={onClose} />
            <div className={`mobile-drawer ${isOpen ? 'open' : ''}`}>
                <div className="drawer-header">
                    <span className="nav-logo drawer-logo">Comic<span>Verse</span></span>
                    <button onClick={onClose} className="drawer-close-btn">
                        <X size={20} />
                    </button>
                </div>

                {user && (
                    <div className="drawer-user-card">
                        <div className="drawer-avatar" style={{ overflow: 'hidden' }}>
                            {user.avatar_url ? (
                                <img src={user.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={user.username} />
                            ) : (
                                user.username ? user.username.charAt(0).toUpperCase() : <UserIcon size={20} />
                            )}
                        </div>
                        <div className="drawer-user-info">
                            <span className="drawer-username">{user.username}</span>
                            <span className="drawer-email">{user.email}</span>
                        </div>
                    </div>
                )}

                <div className="drawer-nav-section">
                    <div className="drawer-section-label">{t('navigation')}</div>
                    <div className="drawer-nav-links">
                        {navLinks.map(link => (
                            <Link 
                                key={link.path} 
                                to={link.path} 
                                className="drawer-nav-link" 
                                onClick={onClose}
                            >
                                <span className="drawer-link-icon">{link.icon}</span>
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>

                {user && (
                    <div className="drawer-nav-section">
                        <div className="drawer-section-label">{t('personal')}</div>
                        <div className="drawer-nav-links">
                            {personalLinks.map(link => (
                                <Link 
                                    key={link.path} 
                                    to={link.path} 
                                    className="drawer-nav-link" 
                                    onClick={onClose}
                                >
                                    <span className="drawer-link-icon">{link.icon}</span>
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                <div className="drawer-nav-section">
                    <div className="drawer-section-label">{t('system')}</div>
                    <div className="drawer-nav-links">
                        <button className="drawer-nav-link" onClick={toggleTheme}>
                            <span className="drawer-link-icon">
                                <Palette size={18} />
                            </span>
                            {t('theme')} {theme === 'dark' ? t('theme_dark') : t('theme_light')}
                            <span className="drawer-link-badge">
                                {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
                            </span>
                        </button>



                        {user?.role === 'admin' && (
                            <Link to="/admin" className="drawer-nav-link drawer-nav-admin" onClick={onClose}>
                                <span className="drawer-link-icon"><Shield size={18} /></span>
                                Admin Panel
                            </Link>
                        )}
                    </div>
                </div>

                <div className="drawer-footer">
                    {user ? (
                        <button className="drawer-logout-btn" onClick={handleLogout}>
                            {t('logout')}
                        </button>
                    ) : (
                        <button className="drawer-login-btn" onClick={() => { navigate('/auth'); onClose(); }}>
                            <UserIcon size={18} />
                            {t('login')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MobileMenu;
