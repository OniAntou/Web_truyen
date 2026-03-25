import React, { useState } from 'react';
import { UserCheck, UserX, Clock, Search, ExternalLink, HelpCircle } from 'lucide-react';

const ApplicationManager = () => {
    const [applications, setApplications] = useState([]);
    const [filter, setFilter] = useState('pending'); // 'all', 'pending', 'approved', 'rejected'
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        fetch('http://localhost:5000/api/admin/applications')
            .then(res => res.json())
            .then(data => {
                const formatted = data.map(app => ({
                    id: app._id,
                    penName: app.penName,
                    email: app.user_id?.email || 'Không rõ',
                    portfolio: app.portfolio,
                    reason: app.reason,
                    status: app.status,
                    date: new Date(app.created_at).toLocaleDateString()
                }));
                setApplications(formatted);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const handleApprove = async (id) => {
        try {
            const res = await fetch(`http://localhost:5000/api/admin/applications/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'approved' })
            });
            if (res.ok) {
                setApplications(apps => apps.map(app => app.id === id ? { ...app, status: 'approved' } : app));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleReject = async (id) => {
        try {
            const res = await fetch(`http://localhost:5000/api/admin/applications/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'rejected' })
            });
            if (res.ok) {
                setApplications(apps => apps.map(app => app.id === id ? { ...app, status: 'rejected' } : app));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const filteredApps = applications.filter(app => filter === 'all' || app.status === filter);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'pending': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
            case 'approved': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
            case 'rejected': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
            default: return 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20';
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 mt-16 animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
                <div>
                    <h2 className="text-3xl font-medium text-white tracking-tight flex items-center gap-3">
                        <UserCheck className="text-zinc-500" /> Creator Applications
                    </h2>
                    <p className="text-zinc-400 mt-2 text-sm">Review and approve new content creators for your platform.</p>
                </div>
                
                {/* Filters */}
                <div className="flex bg-zinc-900/50 p-1.5 rounded-2xl border border-white/5 backdrop-blur-md">
                    {['all', 'pending', 'approved', 'rejected'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-5 py-2 rounded-xl text-sm font-medium capitalize transition-all duration-300 ${
                                filter === f 
                                    ? 'bg-white text-black shadow-lg' 
                                    : 'text-zinc-500 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* List Section */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-10 text-zinc-500">Đang tải dữ liệu...</div>
                ) : filteredApps.length === 0 ? (
                    <div className="bg-zinc-900/30 border border-white/5 rounded-[2rem] p-16 text-center backdrop-blur-md">
                        <HelpCircle className="mx-auto text-zinc-600 mb-4" size={48} strokeWidth={1} />
                        <h3 className="text-white text-lg font-medium">No Applications Found</h3>
                        <p className="text-zinc-500 mt-2 text-sm">There are no {filter !== 'all' ? filter : ''} creator applications at the moment.</p>
                    </div>
                ) : (
                    filteredApps.map(app => (
                        <div key={app.id} className="bg-zinc-900/30 border border-white/5 p-6 rounded-[2rem] hover:bg-zinc-900/50 transition-all duration-300 backdrop-blur-md flex flex-col lg:flex-row gap-6 lg:items-center">
                            
                            {/* App Info */}
                            <div className="flex-1 space-y-4">
                                <div className="flex items-center gap-4 flex-wrap">
                                    <h3 className="text-xl font-medium text-white tracking-tight">{app.penName}</h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${getStatusStyle(app.status)}`}>
                                        {app.status}
                                    </span>
                                    <span className="text-xs font-medium text-zinc-500 flex items-center gap-1.5">
                                        <Clock size={14} /> {app.date}
                                    </span>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[0.65rem] font-bold text-zinc-600 uppercase tracking-widest mb-1.5">Contact Email</p>
                                        <p className="text-zinc-300 text-sm">{app.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-[0.65rem] font-bold text-zinc-600 uppercase tracking-widest mb-1.5">Portfolio / Link</p>
                                        {app.portfolio ? (
                                            <a href={app.portfolio} target="_blank" rel="noreferrer" className="text-[var(--accent)] hover:underline text-sm flex items-center gap-1.5 group w-fit">
                                                {app.portfolio} <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                            </a>
                                        ) : (
                                            <p className="text-zinc-600 text-sm italic">Not provided</p>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <p className="text-[0.65rem] font-bold text-zinc-600 uppercase tracking-widest mb-1.5">Message / Reason</p>
                                    <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                                        <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap">{app.reason}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            {app.status === 'pending' && (
                                <div className="shrink-0 flex lg:flex-col gap-3 pt-4 border-t lg:border-t-0 lg:border-l border-white/5 lg:pl-6 lg:pt-0">
                                    <button 
                                        onClick={() => handleApprove(app.id)}
                                        className="flex-1 lg:w-36 py-3 px-4 rounded-xl font-medium text-sm border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all duration-300 flex items-center justify-center gap-2 group"
                                    >
                                        <UserCheck size={18} className="group-hover:scale-110 transition-transform" /> Approve
                                    </button>
                                    <button 
                                        onClick={() => handleReject(app.id)}
                                        className="flex-1 lg:w-36 py-3 px-4 rounded-xl font-medium text-sm border border-rose-500/20 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all duration-300 flex items-center justify-center gap-2 group"
                                    >
                                        <UserX size={18} className="group-hover:scale-110 transition-transform" /> Reject
                                    </button>
                                </div>
                            )}

                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ApplicationManager;
