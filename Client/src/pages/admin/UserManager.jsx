import React, { useEffect, useState, useCallback } from 'react';
import { Search, Trash2, Shield, Crown, ChevronLeft, ChevronRight, X, Users, Eye, MessageSquare, Heart, DollarSign, Coins, Star, RefreshCw, Filter } from 'lucide-react';
import { API_BASE_URL } from '../../constants/api';

const ROLES = [
    { value: 'user', label: 'User', color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' },
    { value: 'creator', label: 'Creator', color: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
    { value: 'admin', label: 'Admin', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
];

const getRoleBadge = (role) => {
    const r = ROLES.find(r => r.value === role) || ROLES[0];
    return (
        <span className={`px-2.5 py-1 rounded-lg text-[0.6rem] uppercase tracking-widest font-bold border ${r.color}`}>
            {r.label}
        </span>
    );
};

const UserDetailModal = ({ user, onClose, onUpdate, onDelete }) => {
    const [editRole, setEditRole] = useState(user?.role || 'user');
    const [editVip, setEditVip] = useState(user?.is_vip || false);
    const [editCoins, setEditCoins] = useState(user?.coins || 0);
    const [saving, setSaving] = useState(false);
    const [details, setDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(true);

    useEffect(() => {
        if (!user) return;
        const token = localStorage.getItem('token');
        fetch(`${API_BASE_URL}/admin/users/${user._id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => {
                if (res.status === 401 || res.status === 403) {
                    localStorage.removeItem('admin');
                    localStorage.removeItem('token');
                    window.location.href = '/admin/login';
                    return;
                }
                return res.json();
            })
            .then(data => {
                if (data) {
                    setDetails(data);
                    setEditRole(data.role);
                    setEditVip(data.is_vip);
                    setEditCoins(data.coins);
                }
                setLoadingDetails(false);
            })
            .catch(() => setLoadingDetails(false));
    }, [user]);

    const handleSave = async () => {
        setSaving(true);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_BASE_URL}/admin/users/${user._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    role: editRole,
                    is_vip: editVip,
                    coins: parseInt(editCoins) || 0
                })
            });
            if (res.ok) {
                const updated = await res.json();
                onUpdate(updated);
                onClose();
            } else {
                const err = await res.json();
                alert(err.message || 'Lỗi khi cập nhật');
            }
        } catch (e) {
            alert('Lỗi kết nối');
        }
        setSaving(false);
    };

    const handleDelete = async () => {
        if (!window.confirm(`Bạn có chắc muốn xoá user "${user.username}"? Hành động này không thể hoàn tác.`)) return;
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_BASE_URL}/admin/users/${user._id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                onDelete(user._id);
                onClose();
            } else {
                const err = await res.json();
                alert(err.message || 'Lỗi khi xoá user');
            }
        } catch (e) {
            alert('Lỗi kết nối');
        }
    };

    if (!user) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={onClose}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
            
            {/* Modal */}
            <div 
                className="relative bg-[#111111] border border-white/10 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-fadeIn"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-8 pb-0">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center">
                                <span className="text-2xl font-bold text-white">
                                    {user.username?.charAt(0)?.toUpperCase() || '?'}
                                </span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white tracking-tight">{user.username}</h3>
                                <p className="text-zinc-500 text-xs mt-0.5">{user.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-white/5 transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {loadingDetails ? (
                    <div className="p-8 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-rose-500/20 border-t-rose-500 rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* User Stats */}
                        {details?.stats && (
                            <div className="px-8 pt-6">
                                <p className="text-[0.6rem] font-bold text-zinc-600 uppercase tracking-widest mb-3">Activity Stats</p>
                                <div className="grid grid-cols-5 gap-2">
                                    {[
                                        { icon: Eye, label: 'Views', val: details.stats.views },
                                        { icon: Star, label: 'Ratings', val: details.stats.ratings },
                                        { icon: MessageSquare, label: 'Comments', val: details.stats.comments },
                                        { icon: Heart, label: 'Favorites', val: details.stats.favorites },
                                        { icon: DollarSign, label: 'Spent', val: details.stats.totalSpent?.toLocaleString('vi-VN') || 0 },
                                    ].map(s => (
                                        <div key={s.label} className="bg-white/[0.03] rounded-xl p-3 text-center border border-white/5">
                                            <s.icon size={14} className="mx-auto text-zinc-500 mb-1" />
                                            <div className="text-white text-sm font-bold tabular-nums">{s.val}</div>
                                            <div className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest mt-0.5">{s.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Editable Fields */}
                        <div className="p-8 space-y-5">
                            <p className="text-[0.6rem] font-bold text-zinc-600 uppercase tracking-widest">Edit User</p>
                            
                            {/* Role */}
                            <div>
                                <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest block mb-2">Role</label>
                                <div className="flex gap-2">
                                    {ROLES.map(r => (
                                        <button
                                            key={r.value}
                                            onClick={() => setEditRole(r.value)}
                                            className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all duration-200 ${
                                                editRole === r.value
                                                    ? r.color + ' ring-1 ring-current'
                                                    : 'bg-white/[0.03] text-zinc-600 border-white/5 hover:bg-white/5'
                                            }`}
                                        >
                                            {r.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* VIP Status */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest block">VIP Status</label>
                                    {user.vip_expiry && (
                                        <p className="text-zinc-600 text-[9px] mt-0.5">
                                            Expires: {new Date(user.vip_expiry).toLocaleDateString('vi-VN')}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={() => setEditVip(!editVip)}
                                    className={`relative w-12 h-6 rounded-full transition-all duration-300 ${editVip ? 'bg-amber-500' : 'bg-zinc-700'}`}
                                >
                                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${editVip ? 'left-[1.625rem]' : 'left-0.5'}`} />
                                </button>
                            </div>

                            {/* Coins */}
                            <div>
                                <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest block mb-2">
                                    <span className="flex items-center gap-1.5"><Coins size={12} /> Coins Balance</span>
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={editCoins}
                                    onChange={e => setEditCoins(e.target.value)}
                                    className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-white/20 transition-all tabular-nums"
                                />
                            </div>

                            {/* Account Info */}
                            <div className="flex items-center gap-4 text-zinc-600 text-[9px] font-medium pt-2 border-t border-white/5">
                                <span>ID: {user._id}</span>
                                <span>•</span>
                                <span>Joined: {new Date(user.created_at).toLocaleDateString('vi-VN')}</span>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="px-8 pb-8 flex items-center justify-between gap-3">
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2.5 rounded-lg text-red-500 bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-all text-xs font-bold uppercase tracking-tight flex items-center gap-2"
                            >
                                <Trash2 size={16} />
                                Delete
                            </button>
                            <div className="flex gap-2">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2.5 rounded-lg text-zinc-500 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all text-xs font-bold uppercase tracking-tight"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="px-5 py-2.5 rounded-lg text-black bg-white hover:bg-zinc-200 transition-all text-xs font-bold uppercase tracking-tight disabled:opacity-50 active:scale-95"
                                >
                                    {saving ? 'Syncing...' : 'Save Sync'}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

const UserManager = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [vipFilter, setVipFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showFilters, setShowFilters] = useState(false);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        const params = new URLSearchParams();
        if (debouncedSearch) params.set('search', debouncedSearch);
        if (roleFilter) params.set('role', roleFilter);
        if (vipFilter) params.set('vip', vipFilter);
        params.set('page', page);
        params.set('limit', 15);
        params.set('sort', 'created_at');
        params.set('order', 'desc');

        try {
            const res = await fetch(`${API_BASE_URL}/admin/users?${params.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.status === 401 || res.status === 403) {
                localStorage.removeItem('admin');
                localStorage.removeItem('token');
                window.location.href = '/admin/login';
                return;
            }
            const data = await res.json();
            setUsers(data.users || []);
            setTotalPages(data.totalPages || 1);
            setTotal(data.total || 0);
        } catch (err) {
            console.error('Error fetching users:', err);
        }
        setLoading(false);
    }, [debouncedSearch, roleFilter, vipFilter, page]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, roleFilter, vipFilter]);

    const handleUserUpdate = (updatedUser) => {
        setUsers(prev => prev.map(u => u._id === updatedUser._id ? { ...u, ...updatedUser } : u));
    };

    const handleUserDelete = (deletedId) => {
        setUsers(prev => prev.filter(u => u._id !== deletedId));
        setTotal(prev => prev - 1);
    };

    return (
        <div className="mt-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end pb-6 border-b border-white/5 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">User Registry</h2>
                    <p className="text-zinc-500 mt-1 text-sm font-medium">Manage and audit platform participants.</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    {/* Search */}
                    <div className="relative group flex-1 md:w-64">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#141414] border border-white/5 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-white/20 transition-all placeholder-zinc-700 font-medium"
                        />
                    </div>
 
                    {/* Filter Toggle */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`p-2.5 rounded-lg border transition-all duration-200 ${showFilters ? 'bg-white text-black border-white' : 'bg-black border-white/5 text-zinc-500 hover:text-white hover:bg-white/[0.03]'}`}
                    >
                        <Filter size={18} />
                    </button>
 
                    {/* Refresh */}
                    <button
                        onClick={fetchUsers}
                        className="p-2.5 rounded-lg bg-black border border-white/5 text-zinc-500 hover:text-white hover:bg-white/[0.03] transition-all duration-300"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            {showFilters && (
                <div className="mb-6 flex flex-wrap items-center gap-3 p-5 bg-zinc-900/30 rounded-2xl border border-white/5 animate-fadeIn">
                    <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mr-2">Filters:</span>

                    {/* Role Filter */}
                    <div className="flex items-center gap-1.5">
                        <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">Role:</span>
                        <select
                            value={roleFilter}
                            onChange={e => setRoleFilter(e.target.value)}
                            className="bg-black/30 border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-white/20 appearance-none cursor-pointer"
                        >
                            <option value="">All</option>
                            <option value="user">User</option>
                            <option value="creator">Creator</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    {/* VIP Filter */}
                    <div className="flex items-center gap-1.5">
                        <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">VIP:</span>
                        <select
                            value={vipFilter}
                            onChange={e => setVipFilter(e.target.value)}
                            className="bg-black/30 border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-white/20 appearance-none cursor-pointer"
                        >
                            <option value="">All</option>
                            <option value="true">VIP Only</option>
                            <option value="false">Non-VIP</option>
                        </select>
                    </div>

                    {(roleFilter || vipFilter) && (
                        <button
                            onClick={() => { setRoleFilter(''); setVipFilter(''); }}
                            className="ml-auto text-zinc-500 hover:text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 transition-colors"
                        >
                            <X size={12} /> Clear
                        </button>
                    )}
                </div>
            )}

            {/* Table */}
            <div className="bg-[#141414] rounded-xl border border-white/5 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/[0.02] text-zinc-500 border-b border-white/5 uppercase text-[0.65rem] font-bold tracking-wider">
                                <th className="px-6 py-4 font-bold">User</th>
                                <th className="px-6 py-4 font-bold">Email</th>
                                <th className="px-6 py-4 font-bold">Role</th>
                                <th className="px-6 py-4 text-center">VIP</th>
                                <th className="px-6 py-4 text-right">Coins</th>
                                <th className="px-6 py-4 text-right">Joined</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.02] text-zinc-400">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-16 text-center">
                                        <div className="flex items-center justify-center gap-3">
                                            <div className="w-6 h-6 border-2 border-rose-500/20 border-t-rose-500 rounded-full animate-spin" />
                                            <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Loading users...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : users.length > 0 ? users.map(user => (
                                <tr
                                    key={user._id}
                                    className="hover:bg-white/[0.01] transition-colors duration-200 group cursor-pointer"
                                    onClick={() => setSelectedUser(user)}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
                                                <span className="text-xs font-bold text-white">
                                                    {user.username?.charAt(0)?.toUpperCase() || '?'}
                                                </span>
                                            </div>
                                            <div>
                                                <div className="font-bold text-white text-sm flex items-center gap-2">
                                                    {user.username}
                                                    {user.is_vip && (
                                                        <Crown size={12} className="text-amber-500" />
                                                    )}
                                                </div>
                                                <div className="text-[10px] text-zinc-600 font-medium">
                                                    ID: {user._id.substring(0, 8)}...
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-zinc-500">{user.email}</td>
                                    <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                                    <td className="px-6 py-4 text-center">
                                        {user.is_vip ? (
                                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[0.6rem] font-bold border border-amber-500/10 text-amber-500 bg-amber-500/5 uppercase">
                                                <Crown size={10} /> VIP
                                            </span>
                                        ) : (
                                            <span className="text-zinc-800 text-[0.6rem] font-bold">—</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-white text-sm font-bold tabular-nums">{(user.coins || 0).toLocaleString('vi-VN')}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-xs text-zinc-600 font-medium tabular-nums">
                                        {new Date(user.created_at).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => setSelectedUser(user)}
                                                className="p-2 text-zinc-600 hover:text-white transition-colors"
                                                title="Edit User"
                                            >
                                                <Shield size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-16 text-center">
                                        <Users size={32} className="mx-auto text-zinc-700 mb-3" />
                                        <p className="text-zinc-500 text-sm tracking-wide">No users found matching your criteria.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-white/5">
                        <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
                            Page {page} of {totalPages} • {total} total users
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={16} />
                            </button>

                            {/* Page numbers */}
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (page <= 3) {
                                    pageNum = i + 1;
                                } else if (page >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = page - 2 + i;
                                }
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setPage(pageNum)}
                                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                                            pageNum === page
                                                ? 'bg-white text-black'
                                                : 'text-zinc-500 hover:text-white hover:bg-white/5'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedUser && (
                <UserDetailModal
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                    onUpdate={handleUserUpdate}
                    onDelete={handleUserDelete}
                />
            )}

            {/* Animation keyframes */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95) translateY(10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
            `}</style>
        </div>
    );
};

export default UserManager;
