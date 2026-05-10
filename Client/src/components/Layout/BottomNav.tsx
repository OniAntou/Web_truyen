import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Compass, Search, Bookmark, User } from 'lucide-react';

const BottomNav: React.FC = () => {
    const location = useLocation();
    
    // Hide BottomNav on reading page to maximize reading area
    if (location.pathname.startsWith('/read/')) return null;

    const navItems = [
        { icon: Home, label: 'Home', path: '/' },
        { icon: Compass, label: 'Khám Phá', path: '/popular' },
        { icon: Search, label: 'Tìm Kiếm', path: '/search' },
        { icon: Bookmark, label: 'Tủ Sách', path: '/history' },
        { icon: User, label: 'Tôi', path: '/profile' },
    ];

    return (
        <nav className="mobile-bottom-nav" id="mobile-bottom-nav">
            <div className="bottom-nav-inner">
                {navItems.map((item) => {
                    const isActive = item.path === '/' 
                        ? location.pathname === '/'
                        : location.pathname.startsWith(item.path);
                    const IconComponent = item.icon;
                    
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
                            id={`bottom-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                            <div className="bottom-nav-icon-wrap">
                                {isActive && <div className="bottom-nav-indicator" />}
                                <IconComponent size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                            </div>
                            <span className="bottom-nav-label">{item.label}</span>
                        </NavLink>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNav;
