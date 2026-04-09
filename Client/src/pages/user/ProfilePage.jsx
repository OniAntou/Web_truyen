import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Layout/Navbar';
import Footer from '../../components/Layout/Footer';
import { Crown, Plus, Clock, Pencil, Check, X, Trash2, AlertTriangle, History } from 'lucide-react';
import { API_BASE_URL } from '../../constants/api';

const ProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [transactions, setTransactions] = useState({ payments: [], unlocks: [] });
    const [loadingHistory, setLoadingHistory] = useState(false);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        window.scrollTo(0, 0);
        if (!token) { navigate('/auth'); return; }
        fetch(`${API_BASE_URL}/users/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => {
            if (res.status === 401 || res.status === 403) {
                localStorage.removeItem('token'); localStorage.removeItem('user');
                navigate('/auth'); return null;
            }
            if (!res.ok) throw new Error('Lỗi');
            return res.json();
        })
        .then(data => { if (data) { setProfile(data); setLoading(false); } })
        .catch(() => setLoading(false));
    }, [navigate, token]);

    const showToast = (msg, type = 'ok') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const startEdit = (field) => { setEditing(field); setEditValue(profile[field] || ''); };
    const cancelEdit = () => { setEditing(null); setEditValue(''); };

    const saveEdit = async () => {
        if (!editing) return;
        const trimmed = editValue.trim();
        if (trimmed === profile[editing]) { cancelEdit(); return; }
        setSaving(true);
        try {
            const res = await fetch(`${API_BASE_URL}/users/me`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ [editing]: trimmed })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Lỗi cập nhật');
            setProfile(data);
            showToast('Đã cập nhật thành công');
            cancelEdit();
        } catch (err) {
            showToast(err.message, 'err');
        } finally { setSaving(false); }
    };

    const handleDeleteAccount = async () => {
        setSaving(true);
        try {
            const res = await fetch(`${API_BASE_URL}/users/me`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Lỗi xóa tài khoản');
            }
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/');
        } catch (err) {
            showToast(err.message, 'err');
            setShowDeleteModal(false);
        } finally {
            setSaving(false);
        }
    };

    const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
            const res = await fetch(`${API_BASE_URL}/users/transactions`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setTransactions(data);
            }
        } catch (err) {
            console.error('Failed to fetch history', err);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleOpenHistory = () => {
        setShowHistoryModal(true);
        fetchHistory();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') saveEdit();
        if (e.key === 'Escape') cancelEdit();
    };

    const isVip = profile?.is_vip && profile?.vip_expiry && new Date(profile.vip_expiry) > new Date();
    const daysLeft = isVip ? Math.max(0, Math.ceil((new Date(profile.vip_expiry) - new Date()) / 86400000)) : 0;
    const roleLabel = { admin: 'Admin', creator: 'Creator', user: 'Thành viên' };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
                <Navbar />
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>Đang tải...</div>
                <Footer />
            </div>
        );
    }

    if (!profile) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
                <Navbar />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: 'var(--text-secondary)' }}>
                    <p>Phiên đăng nhập hết hạn.</p>
                    <button className="btn btn-primary" onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/auth'); }}>Đăng nhập lại</button>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
            <Navbar />

            <div className="container" style={{ flex: 1, paddingTop: '7rem', paddingBottom: '3rem' }}>
                {/* Page title */}
                <h2 className="section-title" style={{ marginBottom: '2rem' }}>Hồ Sơ Cá Nhân</h2>

                <div className="profile-layout">
                    {/* ── Sidebar ── */}
                    <div className="profile-sidebar">
                        <div className="glass-panel" style={{ borderRadius: '1rem', padding: '2rem', textAlign: 'center' }}>
                            <div className="profile-letter">{profile.username?.charAt(0).toUpperCase()}</div>
                            <h3 style={{ margin: '0.75rem 0 0.25rem', fontSize: '1.25rem', fontWeight: 700 }}>{profile.username}</h3>
                            <span className="featured-badge" style={{ marginBottom: 0 }}>{roleLabel[profile.role] || profile.role}</span>
                            <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                Tham gia {new Date(profile.created_at).toLocaleDateString('vi-VN')}
                            </p>
                        </div>

                        <button 
                            className="profile-delete-btn" 
                            onClick={() => setShowDeleteModal(true)}
                            style={{ width: '100%', marginTop: '1rem' }}
                        >
                            <Trash2 size={16} /> Xóa tài khoản
                        </button>
                    </div>

                    {/* ── Main content ── */}
                    <div className="profile-main">
                        {/* Info card */}
                        <div className="glass-panel" style={{ borderRadius: '1rem', padding: '1.5rem' }}>
                            <h4 className="profile-card-heading">Thông tin cá nhân</h4>

                            {/* Username */}
                            <div className="profile-field">
                                <span className="profile-field-label">Tên hiển thị</span>
                                {editing === 'username' ? (
                                    <div className="profile-field-edit">
                                        <input className="profile-input" value={editValue} onChange={e => setEditValue(e.target.value)} onKeyDown={handleKeyDown} autoFocus disabled={saving} />
                                        <button className="profile-icon-btn ok" onClick={saveEdit} disabled={saving}><Check size={15} /></button>
                                        <button className="profile-icon-btn cancel" onClick={cancelEdit} disabled={saving}><X size={15} /></button>
                                    </div>
                                ) : (
                                    <div className="profile-field-display">
                                        <span>{profile.username}</span>
                                        <button className="profile-icon-btn edit" onClick={() => startEdit('username')}><Pencil size={13} /></button>
                                    </div>
                                )}
                            </div>

                            {/* Email */}
                            <div className="profile-field" style={{ borderBottom: 'none' }}>
                                <span className="profile-field-label">Email</span>
                                {editing === 'email' ? (
                                    <div className="profile-field-edit">
                                        <input className="profile-input" type="email" value={editValue} onChange={e => setEditValue(e.target.value)} onKeyDown={handleKeyDown} autoFocus disabled={saving} />
                                        <button className="profile-icon-btn ok" onClick={saveEdit} disabled={saving}><Check size={15} /></button>
                                        <button className="profile-icon-btn cancel" onClick={cancelEdit} disabled={saving}><X size={15} /></button>
                                    </div>
                                ) : (
                                    <div className="profile-field-display">
                                        <span>{profile.email}</span>
                                        <button className="profile-icon-btn edit" onClick={() => startEdit('email')}><Pencil size={13} /></button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Balance & VIP row */}
                        <div className="profile-stats-row">
                            {/* Xu */}
                            <div className="glass-panel" style={{ borderRadius: '1rem', padding: '1.5rem', flex: 1 }}>
                                <h4 className="profile-card-heading">Số dư</h4>
                                <div style={{ fontSize: '1.6rem', fontWeight: 700, margin: '0.5rem 0' }}>
                                    {(profile.coins || 0).toLocaleString('vi-VN')} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>xu</span>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button className="btn btn-glass" style={{ flex: 1, fontSize: '0.85rem' }} onClick={() => navigate('/payment/topup')}>
                                        <Plus size={15} /> Nạp Xu
                                    </button>
                                    <button className="btn btn-glass" style={{ flex: 1, fontSize: '0.85rem' }} onClick={handleOpenHistory}>
                                        <History size={15} /> Lịch sử
                                    </button>
                                </div>
                            </div>

                            {/* VIP */}
                            <div className="glass-panel" style={{ borderRadius: '1rem', padding: '1.5rem', flex: 1, borderColor: isVip ? 'rgba(245,158,11,0.2)' : undefined }}>
                                <h4 className="profile-card-heading">VIP</h4>
                                {isVip ? (
                                    <>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f59e0b', fontWeight: 600, fontSize: '0.9rem', margin: '0.5rem 0' }}>
                                            <Crown size={16} /> Đang hoạt động
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                                            <Clock size={13} /> Hết hạn {new Date(profile.vip_expiry).toLocaleDateString('vi-VN')} · còn {daysLeft} ngày
                                        </div>
                                        <div style={{ height: 4, background: 'rgba(245,158,11,0.1)', borderRadius: 4, overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${Math.min(100, (daysLeft / 30) * 100)}%`, background: '#f59e0b', borderRadius: 4, transition: 'width 0.4s' }} />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.5rem 0 0.75rem' }}>Chưa kích hoạt</p>
                                        <button className="btn" style={{ width: '100%', fontSize: '0.85rem', background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }} onClick={() => navigate('/payment/topup')}>
                                            <Crown size={15} /> Nâng cấp VIP
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showDeleteModal && (
                <div className="modal-overlay">
                    <div className="glass-panel modal-content" style={{ borderRadius: '1rem', padding: '2rem', maxWidth: '400px', width: '90%' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: 'var(--accent)' }}>
                            <AlertTriangle size={48} />
                        </div>
                        <h3 style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '1.25rem' }}>Xác nhận xóa tài khoản?</h3>
                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: '1.5' }}>
                            Hành động này không thể hoàn tác. Mọi thông tin, lịch sử đọc truyện và số dư xu của bạn sẽ bị xóa vĩnh viễn.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button 
                                className="btn btn-glass" 
                                style={{ flex: 1 }} 
                                onClick={() => setShowDeleteModal(false)}
                                disabled={saving}
                            >
                                Hủy
                            </button>
                            <button 
                                className="btn btn-primary" 
                                style={{ flex: 1, backgroundColor: 'var(--accent)' }} 
                                onClick={handleDeleteAccount}
                                disabled={saving}
                            >
                                {saving ? 'Đang xóa...' : 'Xác nhận xóa'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* History Modal */}
            {showHistoryModal && (
                <div className="modal-overlay" onClick={(e) => { if (e.target.className === 'modal-overlay') setShowHistoryModal(false); }}>
                    <div className="glass-panel modal-content" style={{ borderRadius: '1rem', padding: '2rem', maxWidth: '750px', width: '95%', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><History size={20} className="text-accent" /> Lịch sử giao dịch</h3>
                            <button className="profile-icon-btn cancel" onClick={() => setShowHistoryModal(false)}><X size={20} /></button>
                        </div>
                        
                        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }} className="custom-scrollbar">
                            {loadingHistory ? (
                                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>Đang tải...</div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {[...transactions.payments.map(p => ({ ...p, type: 'payment' })), ...transactions.unlocks.map(u => ({ ...u, type: 'unlock' }))]
                                        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                                        .map((item, idx) => (
                                            <div key={idx} style={{ 
                                                display: 'flex', alignItems: 'center', gap: '1rem', 
                                                padding: '1rem', background: 'rgba(255,255,255,0.03)', 
                                                borderRadius: '0.75rem', border: '1px solid var(--glass-border)' 
                                            }}>
                                                <div style={{ 
                                                    width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    background: item.type === 'payment' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                                                    color: item.type === 'payment' ? '#10b981' : '#f43f5e'
                                                }}>
                                                    {item.type === 'payment' ? <Plus size={20} /> : <Crown size={20} />}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                                                        {item.type === 'payment' 
                                                            ? `Nạp qua VNPay (${item.status === 'success' ? 'Thành công' : item.status === 'failed' ? 'Thất bại' : 'Đang chờ'})` 
                                                            : `Mở khóa Chapter ${item.chapter_id?.chapter_number || '?'}`}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                        {item.type === 'unlock' && item.chapter_id?.comic_id?.title && <span style={{display: 'block', marginBottom: '0.1rem'}}>{item.chapter_id.comic_id.title}</span>}
                                                        {new Date(item.created_at).toLocaleString('vi-VN')}
                                                    </div>
                                                </div>
                                                <div style={{ 
                                                    fontWeight: 700, whiteSpace: 'nowrap',
                                                    color: item.type === 'payment' && item.status === 'success' ? '#10b981' : item.type === 'unlock' ? '#f43f5e' : 'var(--text-secondary)' 
                                                }}>
                                                    {item.type === 'payment' ? (item.status === 'success' ? '+' : '') + Math.floor(item.amount / 1000 * 100).toLocaleString('vi-VN') : '-' + item.price.toLocaleString('vi-VN')} xu
                                                </div>
                                            </div>
                                        ))}
                                    {transactions.payments.length === 0 && transactions.unlocks.length === 0 && (
                                        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>Chưa có giao dịch nào.</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div className={`profile-toast ${toast.type === 'err' ? 'profile-toast-err' : ''}`}>
                    {toast.msg}
                </div>
            )}

            <Footer />

            <style>{`
                .profile-layout {
                    display: grid;
                    grid-template-columns: 240px 1fr;
                    gap: 2rem;
                    align-items: start;
                }
                .profile-sidebar {
                    display: flex;
                    flex-direction: column;
                }
                .profile-main {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                .profile-letter {
                    width: 80px; height: 80px;
                    border-radius: 50%;
                    background: rgba(244, 63, 94, 0.1);
                    border: 2px solid rgba(244, 63, 94, 0.2);
                    display: flex; align-items: center; justify-content: center;
                    font-size: 2rem; font-weight: 700;
                    color: var(--accent);
                    margin: 0 auto 0.5rem;
                }
                .profile-card-heading {
                    margin: 0 0 0.75rem;
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: var(--text-secondary);
                }
                .profile-stats-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                }

                .profile-delete-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    background: rgba(239, 68, 68, 0.05);
                    border: 1px solid rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                    padding: 0.75rem;
                    border-radius: 0.75rem;
                    font-size: 0.85rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .profile-delete-btn:hover {
                    background: rgba(239, 68, 68, 0.1);
                    border-color: rgba(239, 68, 68, 0.4);
                }

                /* Fields */
                .profile-field {
                    padding: 0.75rem 0;
                    border-bottom: 1px solid var(--glass-border);
                }
                .profile-field-label {
                    display: block;
                    font-size: 0.72rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                    color: var(--text-secondary);
                    margin-bottom: 0.35rem;
                }
                .profile-field-display {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    font-size: 0.92rem;
                    color: var(--text-primary);
                }
                .profile-field-edit {
                    display: flex; gap: 6px; align-items: center;
                }
                .profile-input {
                    flex: 1;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid var(--glass-border);
                    border-radius: 0.5rem;
                    padding: 0.5rem 0.75rem;
                    color: var(--text-primary);
                    font-size: 0.88rem;
                    font-family: inherit;
                    outline: none;
                    transition: border-color 0.2s;
                }
                .profile-input:focus {
                    border-color: var(--accent);
                }
                .profile-icon-btn {
                    background: none; border: none; cursor: pointer;
                    padding: 5px; border-radius: 6px;
                    display: flex; align-items: center;
                    transition: background 0.15s, color 0.15s;
                }
                .profile-icon-btn.edit {
                    color: var(--text-secondary);
                }
                .profile-icon-btn.edit:hover {
                    color: var(--text-primary);
                    background: rgba(255,255,255,0.05);
                }
                .profile-icon-btn.ok { color: #22c55e; }
                .profile-icon-btn.ok:hover { background: rgba(34,197,94,0.1); }
                .profile-icon-btn.cancel { color: var(--text-secondary); }
                .profile-icon-btn.cancel:hover { background: rgba(255,255,255,0.05); }

                /* Modal */
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.8);
                    backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2000;
                    animation: fadeIn 0.3s ease;
                }
                .modal-content {
                    animation: scaleIn 0.3s ease;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }

                /* Toast */
                .profile-toast {
                    position: fixed; bottom: 24px; left: 50%;
                    transform: translateX(-50%);
                    background: var(--glass-bg);
                    backdrop-filter: blur(12px);
                    border: 1px solid var(--glass-border);
                    color: var(--text-primary);
                    padding: 0.75rem 1.5rem;
                    border-radius: 999px;
                    font-size: 0.85rem;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.4);
                    z-index: 999;
                    animation: slideUp 0.3s ease;
                }
                .profile-toast-err {
                    border-color: rgba(239,68,68,0.3);
                    color: #ef4444;
                }

                @media (max-width: 768px) {
                    .profile-layout {
                        grid-template-columns: 1fr;
                    }
                    .profile-stats-row {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default ProfilePage;
