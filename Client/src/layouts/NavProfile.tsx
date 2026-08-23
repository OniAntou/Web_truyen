import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User as UserIcon } from 'lucide-react';
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
            <button className="btn btn-primary" onClick={() => navigate('/auth')}>
                <UserIcon size={18} />
                <span>{t('login')}</span>
            </button>
        );
    }

    return (
        <div className="nav-profile" ref={profileRef} style={{ position: 'relative' }}>
            <div 
                style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', cursor: 'pointer', userSelect: 'none', overflow: 'hidden' }}
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            >
                {user.avatar_url ? (
                    <img src={user.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={user.username} />
                ) : (
                    user.username ? user.username.charAt(0).toUpperCase() : <UserIcon size={18} />
                )}
            </div>
            {showProfileDropdown && (
                <div className="profile-dropdown" style={{ position: 'absolute', top: '120%', right: '0', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.5rem', minWidth: '180px', zIndex: 50, boxShadow: 'var(--shadow-card)' }}>
                    <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)', marginBottom: '0.5rem' }}>
                        <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{user.username}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
                    </div>
                    <Link to="/profile" style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.5rem', background: 'transparent', border: 'none', color: 'var(--text-primary)', textDecoration: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: '600', marginBottom: '0.25rem' }} onClick={() => setShowProfileDropdown(false)}>
                        {t('profile')}
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
                        {t('logout')}
                    </button>
                </div>
            )}
        </div>
    );
};

export default NavProfile;
