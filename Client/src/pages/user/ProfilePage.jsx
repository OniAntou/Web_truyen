import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Layout/Navbar';
import Footer from '../../components/Layout/Footer';
import { User, Mail, Calendar, Shield, Coins, Plus } from 'lucide-react';
import { API_BASE_URL } from '../../constants/api';

const ProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/auth');
            return;
        }

        fetch(`${API_BASE_URL}/users/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => {
            if (res.status === 401 || res.status === 403) {
                // Token is invalid or expired — clear and redirect
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/auth');
                return null;
            }
            if (!res.ok) throw new Error('Không thể tải thông tin user');
            return res.json();
        })
        .then(data => {
            if (data) {
                setProfile(data);
                setLoading(false);
            }
        })
        .catch(err => {
            console.error('ProfilePage error:', err);
            setLoading(false);
        });
    }, [navigate]);

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
                <Navbar />
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-primary)' }}>
                    Đang tải thông tin...
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <div className="container" style={{ flex: 1, padding: '100px 20px 40px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '2rem' }}>
                        <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2.5rem', fontWeight: 'bold', overflow: 'hidden' }}>
                            {profile.avatar ? (
                                <img src={profile.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                profile.username.charAt(0).toUpperCase()
                            )}
                        </div>
                        <div>
                            <h1 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', fontSize: '2rem' }}>{profile.username}</h1>
                            <p style={{ margin: 0, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Mail size={16} /> {profile.email}
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                        <div style={{ padding: '1.5rem', background: 'var(--bg-primary)', borderRadius: '0.75rem', border: '1px solid var(--border)' }}>
                            <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <Shield size={18} /> Chức vụ
                            </div>
                            <div style={{ color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '1.1rem', textTransform: 'capitalize' }}>
                                {profile.role}
                            </div>
                        </div>
                        <div style={{ padding: '1.5rem', background: 'var(--bg-primary)', borderRadius: '0.75rem', border: '1px solid var(--border)' }}>
                            <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <Calendar size={18} /> Ngày tham gia
                            </div>
                            <div style={{ color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                {new Date(profile.created_at).toLocaleDateString('vi-VN')}
                            </div>
                        </div>

                        {/* Balance Section */}
                        <div style={{ padding: '1.5rem', background: 'var(--bg-primary)', borderRadius: '0.75rem', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gridColumn: '1 / -1' }}>
                            <div>
                                <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <Coins size={18} /> Số dư Linh Thạch
                                </div>
                                <div style={{ color: 'var(--accent)', fontWeight: 'bold', fontSize: '1.5rem' }}>
                                    {profile.coins?.toLocaleString() || 0}
                                </div>
                            </div>
                            <button 
                                onClick={() => navigate('/payment/topup')}
                                className="nav-button accent"
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', height: 'auto' }}
                            >
                                <Plus size={18} /> Nạp Linh Thạch
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ProfilePage;
