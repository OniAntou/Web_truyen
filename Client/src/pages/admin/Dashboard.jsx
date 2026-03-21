import React from 'react';
import { Library, Eye, Activity, Users } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
    <div className="bg-zinc-900/30 p-6 rounded-[2rem] border border-white/5 hover:bg-zinc-900/50 transition-all duration-300 hover:-translate-y-1 shadow-2xl relative overflow-hidden group backdrop-blur-2xl">
        <div className="absolute -top-6 -right-6 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-white">
            <Icon size={120} strokeWidth={1} />
        </div>

        <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 bg-white/5 border border-white/10 text-white shadow-inner">
                <Icon size={20} strokeWidth={1.5} />
            </div>
            <h3 className="text-zinc-500 text-[0.65rem] font-bold uppercase tracking-widest mb-1.5">{title}</h3>
            <p className="text-4xl font-medium text-white tracking-tight">{value}</p>
            {subtext && <p className="text-xs text-zinc-500 mt-2 font-medium">{subtext}</p>}
        </div>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = React.useState({ totalComics: 0, totalViews: '0' });
    const [systemStatus, setSystemStatus] = React.useState('Checking...');

    React.useEffect(() => {
        fetch('http://localhost:5000/api/stats')
            .then(res => res.json())
            .then(data => {
                setStats(data);
                setSystemStatus('Active');
            })
            .catch(err => {
                console.error('Error fetching stats:', err);
                setSystemStatus('Offline');
            });
    }, []);

    return (
        <div className="max-w-7xl mx-auto space-y-8 mt-16">
            <div className="mb-10">
                <h2 className="text-3xl font-medium text-white tracking-tight">Dashboard Overview</h2>
                <p className="text-zinc-400 mt-2 text-sm">Welcome back, Administrator. Here's what's happening today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Comics"
                    value={stats.totalComics}
                    icon={Library}
                    subtext="Available in library"
                />

                <StatCard
                    title="Total Views"
                    value={stats.totalViews}
                    icon={Eye}
                    subtext="Across all chapters"
                />

                <StatCard
                    title="System Status"
                    value={systemStatus}
                    icon={Activity}
                    subtext={systemStatus === 'Active' ? "Server running normally" : "Cannot connect to server"}
                />
            </div>

            <div className="mt-10 bg-zinc-900/30 rounded-[2rem] border border-white/5 p-8 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                <h3 className="text-xl font-medium text-white mb-3 relative z-10 tracking-tight">Quick Actions</h3>
                <p className="text-zinc-400 mb-8 max-w-2xl relative z-10 text-sm leading-relaxed">
                    Manage your comic library efficiently. Add new series, update existing chapters, or moderate content directly from the management panel.
                </p>

                <div className="flex gap-4 relative z-10">
                    <a href="/admin/comics/new" className="px-6 py-3.5 bg-white text-black font-semibold rounded-2xl hover:bg-zinc-200 transition-all duration-300 text-sm tracking-wide shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                        Add New Comic
                    </a>
                    <a href="/admin/comics" className="px-6 py-3.5 bg-black/50 text-white font-medium rounded-2xl hover:bg-zinc-800 transition-all duration-300 border border-white/10 text-sm tracking-wide backdrop-blur-md">
                        View Compendium
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
