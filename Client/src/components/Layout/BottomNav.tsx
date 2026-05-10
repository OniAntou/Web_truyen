import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Compass, Search, Bookmark, User } from 'lucide-react';

const BottomNav: React.FC = () => {
    const location = useLocation();
    
    // Hide BottomNav on reading page to maximize reading area
    if (location.pathname.startsWith('/read/')) return null;

    const navItems = [
        { icon: <Home size={22} />, label: 'Home', path: '/' },
        { icon: <Compass size={22} />, label: 'Khám Phá', path: '/popular' },
        { icon: <Search size={22} />, label: 'Tìm Kiếm', path: '/search' },
        { icon: <Bookmark size={22} />, label: 'Tủ Sách', path: '/history' },
        { icon: <User size={22} />, label: 'Tôi', path: '/profile' },
    ];

    return (
        <nav className="mobile-only fixed bottom-0 left-0 right-0 z-[1000] h-[var(--nav-bottom-height)] bg-[var(--bg-secondary)] border-t border-[var(--border)] backdrop-blur-xl bg-opacity-80 px-2 shadow-[0_-4px_20px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-around h-full max-w-md mx-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => 
                            `flex flex-col items-center justify-center gap-1 w-full h-full transition-all duration-300 ${
                                isActive ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'
                            }`
                        }
                    >
                        <div className="relative">
                            {item.icon}
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-tighter">
                            {item.label}
                        </span>
                    </NavLink>
                ))}
            </div>
        </nav>
    );
};

export default BottomNav;
