import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User as UserIcon, Shield, Sparkles, LogOut, Settings, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from '../hooks/useTranslation';

const NavProfile: React.FC = () => {
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const { user, logout: storeLogout } = useAuthStore();
    const { t } = useTranslation();
    const profileRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setShowProfileDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        storeLogout();
        setShowProfileDropdown(false);
        navigate('/');
    };

    if (!user) {
        return (
            <button 
                className="group relative inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full font-bold text-xs uppercase tracking-wider text-white bg-[var(--accent)] hover:opacity-95 active:scale-95 transition-all shadow-md shadow-[var(--accent)]/25" 
                onClick={() => navigate('/auth')}
            >
                <UserIcon size={15} />
                <span>{t('login')}</span>
            </button>
        );
    }

    return (
        <div className="relative" ref={profileRef}>
            {/* Avatar Button with Double-Bezel ring */}
            <button 
                type="button"
                className="relative p-0.5 rounded-full ring-1 ring-[var(--border)] hover:ring-[var(--accent)] transition-all duration-300 focus:outline-none"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                aria-label="Tài khoản cá nhân"
            >
                <div className="w-9 h-9 rounded-full bg-[var(--accent)] flex items-center justify-center text-white font-bold text-sm overflow-hidden shadow-inner">
                    {user.avatar_url ? (
                        <img src={user.avatar_url} className="w-full h-full object-cover" alt={user.username} />
                    ) : (
                        user.username ? user.username.charAt(0).toUpperCase() : <UserIcon size={16} />
                    )}
                </div>
                {user.is_vip && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-amber-400 border-2 border-[var(--bg-primary)] rounded-full flex items-center justify-center text-[8px] font-black text-black">
                        ★
                    </span>
                )}
            </button>

            {/* Dropdown Floating Card */}
            {showProfileDropdown && (
                <div className="absolute right-0 top-12 w-64 rounded-2xl bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] shadow-2xl p-2 z-50 animate-slide-up-fade">
                    {/* User Info Header */}
                    <div className="px-3.5 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] mb-1.5 flex flex-col gap-0.5">
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-[var(--text-primary)] truncate">{user.username}</span>
                            {user.role === 'admin' ? (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-blue-500/15 text-blue-400 border border-blue-500/20">Admin</span>
                            ) : user.role === 'creator' ? (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-rose-500/15 text-rose-400 border border-rose-500/20">Tác giả</span>
                            ) : user.is_vip ? (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-amber-500/15 text-amber-400 border border-amber-500/20">VIP</span>
                            ) : null}
                        </div>
                        <span className="text-xs text-[var(--text-secondary)] truncate">{user.email}</span>
                        <div className="mt-2 pt-2 border-t border-[var(--border)] flex items-center justify-between text-xs">
                            <span className="text-[var(--text-muted)]">Số dư ví:</span>
                            <span className="font-bold text-amber-400">{user.coins || 0} xu</span>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex flex-col gap-0.5 text-xs font-semibold">
                        <Link 
                            to="/profile" 
                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
                            onClick={() => setShowProfileDropdown(false)}
                        >
                            <Settings size={15} className="text-[var(--text-secondary)]" />
                            <span>{t('profile')}</span>
                        </Link>
                        <Link 
                            to="/topup" 
                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-amber-400 hover:bg-amber-400/10 transition-colors"
                            onClick={() => setShowProfileDropdown(false)}
                        >
                            <Sparkles size={15} />
                            <span>Nạp Xu & Nâng VIP</span>
                        </Link>

                        {user?.role === 'creator' && (
                            <Link 
                                to="/studio" 
                                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors"
                                onClick={() => setShowProfileDropdown(false)}
                            >
                                <LayoutDashboard size={15} />
                                <span>Creator Studio</span>
                            </Link>
                        )}

                        {user?.role === 'admin' && (
                            <Link 
                                to="/admin" 
                                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-blue-400 hover:bg-blue-500/10 transition-colors"
                                onClick={() => setShowProfileDropdown(false)}
                            >
                                <Shield size={15} />
                                <span>Admin Panel</span>
                            </Link>
                        )}

                        <div className="my-1 border-t border-[var(--border)]" />

                        <button 
                            onClick={handleLogout} 
                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors w-full text-left"
                        >
                            <LogOut size={15} />
                            <span>{t('logout')}</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NavProfile;
