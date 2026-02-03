import React from 'react';
import { Library, Eye, Activity, Users } from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = React.useState({ totalComics: 0, totalViews: '0' });

    React.useEffect(() => {
        fetch('http://localhost:5000/api/stats')
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(err => console.error('Error fetching stats:', err));
    }, []);

    const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
        <div className="bg-[#1e1e1e] p-6 rounded-2xl border border-gray-800 hover:border-gray-700 transition-all duration-300 hover:-translate-y-1 shadow-xl relative overflow-hidden group">
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
                <Icon size={80} />
            </div>
            
            <div className="relative z-10">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color.replace('text-', 'bg-').replace('500', '500/20')} ${color}`}>
                    <Icon size={24} />
                </div>
                <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">{title}</h3>
                <p className="text-3xl font-bold text-white">{value}</p>
                {subtext && <p className="text-xs text-gray-500 mt-2">{subtext}</p>}
            </div>
        </div>
    );

    return (
        <div>
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-white">Dashboard Overview</h2>
                <p className="text-gray-400 mt-2">Welcome back, Administrator. Here's what's happening today.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="Total Comics" 
                    value={stats.totalComics} 
                    icon={Library} 
                    color="text-purple-500"
                    subtext="Available in library" 
                />
                
                <StatCard 
                    title="Total Views" 
                    value={stats.totalViews} 
                    icon={Eye} 
                    color="text-emerald-500"
                    subtext="Across all chapters" 
                />
                
                <StatCard 
                    title="System Status" 
                    value="Active" 
                    icon={Activity} 
                    color="text-blue-500"
                    subtext="Server running normally" 
                />
            </div>

            <div className="mt-10 bg-[#1e1e1e] rounded-2xl border border-gray-800 p-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"/>
                
                <h3 className="text-xl font-bold text-white mb-4 relative z-10">Quick Actions</h3>
                <p className="text-gray-400 mb-6 max-w-2xl relative z-10">
                    Manage your comic library efficiently. Add new series, update existing chapters, or moderate content directly from the management panel.
                </p>
                
                <div className="flex gap-4 relative z-10">
                    <a href="/admin/comics/new" className="px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-colors">
                        Add New Comic
                    </a>
                    <a href="/admin/comics" className="px-6 py-3 bg-gray-800 text-white font-semibold rounded-xl hover:bg-gray-700 transition-colors border border-gray-700">
                        View Compendium
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
