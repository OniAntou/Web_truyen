import React, { useState, useEffect } from 'react';
import { 
    Library, 
    Eye, 
    Activity, 
    Users, 
    DollarSign, 
    TrendingUp, 
    ChevronRight,
    ArrowUpRight,
    Calendar
} from 'lucide-react';
import { API_BASE_URL } from '../../constants/api';

const StatCard = ({ title, value, icon: Icon, trend, subtext }) => (
    <div className="bg-zinc-900/40 p-6 rounded-3xl border border-white/5 hover:border-rose-500/30 transition-all duration-300 group relative overflow-hidden">
        <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-rose-500/10 border border-rose-500/20 text-rose-500 group-hover:scale-110 transition-transform duration-300">
                    <Icon size={20} strokeWidth={2} />
                </div>
                {trend && (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                        <ArrowUpRight size={10} />
                        {trend}
                    </div>
                )}
            </div>
            
            <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-1">{title}</h3>
            <div className="flex items-baseline gap-1.5">
                <p className="text-3xl font-bold text-white tabular-nums">
                    {typeof value === 'number' && (title.includes('Revenue') || title.includes('Capital'))
                        ? value.toLocaleString('vi-VN') 
                        : value}
                </p>
                {(title.includes('Revenue') || title.includes('Capital')) && <span className="text-zinc-500 text-xs font-medium">VND</span>}
            </div>
            <p className="text-[10px] text-zinc-500 mt-2 font-medium">
                {subtext}
            </p>
        </div>
    </div>
);

const RevenueChart = ({ data, previousData }) => {
    const [hoveredIdx, setHoveredIdx] = useState(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    if (!data || data.length === 0) return null;

    const maxCurrent = Math.max(...data.map(d => d.amount), 1);
    const maxPrev = previousData ? Math.max(...previousData.map(d => d.amount), 1) : 1;
    const maxAmount = Math.max(maxCurrent, maxPrev, 1);
    
    const chartHeight = 180;
    const chartWidth = 800;
    const paddingX = 60; // Increased padding to prevent label clipping
    const paddingY = 30;
    
    const getPoints = (dSet) => dSet.map((d, i) => {
        const x = (i / (dSet.length - 1)) * (chartWidth - paddingX * 2) + paddingX;
        const y = chartHeight - ((d.amount / maxAmount) * (chartHeight - paddingY * 2)) - paddingY;
        return { x, y };
    });

    const points = getPoints(data);
    const prevPoints = previousData ? getPoints(previousData) : [];

    const getCurvePath = (pts) => {
        if (pts.length < 2) return "";
        let d = `M ${pts[0].x} ${pts[0].y}`;
        for (let i = 0; i < pts.length - 1; i++) {
            const p0 = pts[i];
            const p1 = pts[i + 1];
            const cp1x = p0.x + (p1.x - p0.x) / 3;
            const cp2x = p1.x - (p1.x - p0.x) / 3;
            d += ` C ${cp1x} ${p0.y}, ${cp2x} ${p1.y}, ${p1.x} ${p1.y}`;
        }
        return d;
    };

    const pathD = getCurvePath(points);
    const prevPathD = getCurvePath(prevPoints);
    const areaD = `${pathD} L ${points[points.length-1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`;

    const handleMouseMove = (e) => {
        const svg = e.currentTarget;
        const rect = svg.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * chartWidth;
        let closestIdx = 0;
        let minDist = Math.abs(x - points[0].x);
        points.forEach((p, i) => {
            const dist = Math.abs(x - p.x);
            if (dist < minDist) { minDist = dist; closestIdx = i; }
        });
        setHoveredIdx(closestIdx);
        setTooltipPos({ x: points[closestIdx].x, y: points[closestIdx].y });
    };

    return (
        <div className="bg-zinc-900 shadow-2xl rounded-3xl border border-white/[0.05] p-8 relative overflow-hidden">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">Revenue Insights</h3>
                    <p className="text-zinc-500 text-xs mt-1">Comparing current week performance with previous period.</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-rose-500" />
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Current</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-zinc-700" />
                        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Previous</span>
                    </div>
                </div>
            </div>

            <div className="relative h-[220px] w-full">
                {hoveredIdx !== null && (
                    <>
                        <div 
                            className="absolute z-30 pointer-events-none transition-all duration-150 ease-out"
                            style={{ 
                                left: `${(tooltipPos.x / chartWidth) * 100}%`, 
                                top: `${(tooltipPos.y / chartHeight) * 100}%`,
                                transform: 'translate(-50%, -130%)'
                            }}
                        >
                            <div className="bg-zinc-950/95 border border-white/[0.2] p-2 rounded-lg shadow-lg backdrop-blur-sm min-w-[120px]">
                                <div className="text-zinc-200 text-[9px] uppercase tracking-wide mb-0.5">
                                    {new Date(data[hoveredIdx].date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
                                </div>
                                <div className="text-white font-bold text-xs tracking-tight">
                                    {data[hoveredIdx].amount.toLocaleString('vi-VN')} VND
                                </div>
                            </div>
                        </div>
                        <div className="absolute z-20 w-2 h-2 bg-rose-500 rounded-full"
                            style={{ left: `${(tooltipPos.x / chartWidth) * 100}%`, top: `${(tooltipPos.y / chartHeight) * 100}%`, transform: 'translate(-50%, -50%)' }}
                        />
                    </>
                )}

                <svg 
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
                    className="w-full h-full overflow-visible cursor-crosshair"
                    preserveAspectRatio="none"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => setHoveredIdx(null)}
                >
                    <defs>
                        <filter id="bloom" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="rgba(244, 63, 94, 0.15)" />
                            <stop offset="100%" stopColor="rgba(244, 63, 94, 0)" />
                        </linearGradient>
                    </defs>
                    
                    {[0, 0.25, 0.5, 0.75, 1].map(i => (
                        <line 
                            key={i}
                            x1={paddingX}
                            y1={paddingY + i * (chartHeight - paddingY * 2)}
                            x2={chartWidth - paddingX}
                            y2={paddingY + i * (chartHeight - paddingY * 2)}
                            stroke="white"
                            strokeOpacity="0.03"
                            strokeWidth="1"
                        />
                    ))}

                    <path d={areaD} fill="url(#areaGradient)" />

                    {prevPathD && (
                        <path 
                            d={prevPathD} 
                            fill="none" 
                            stroke="white" 
                            strokeOpacity="0.1" 
                            strokeWidth="1.5" 
                            strokeDasharray="4 4"
                        />
                    )}
                    
                    <path 
                        d={pathD} 
                        fill="none" 
                        stroke="#f43f5e" 
                        strokeWidth="2.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                    />

                    {hoveredIdx !== null && (
                        <g>
                            <line 
                                x1={tooltipPos.x} y1="0" x2={tooltipPos.x} y2={chartHeight}
                                stroke="#f43f5e" strokeOpacity="0.15" strokeWidth="1"
                            />
                            <circle 
                                cx={tooltipPos.x} cy={tooltipPos.y} r="1"
                                fill="#f43f5e" 
                            />
                        </g>
                    )}
                </svg>

                {/* Timeline Labels */}
                <div className="flex justify-between mt-6 relative z-10" style={{ paddingLeft: `${(paddingX / chartWidth) * 100}%`, paddingRight: `${(paddingX / chartWidth) * 100}%` }}>
                    {data.map((d, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 w-0 overflow-visible">
                            <div className={`text-[9px] font-bold uppercase tracking-wider transition-colors duration-300 whitespace-nowrap ${hoveredIdx === i ? 'text-rose-500' : 'text-zinc-600'}`}>
                                {new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })}
                            </div>
                            {hoveredIdx === i && <div className="w-1 h-1 rounded-full bg-rose-500" />}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};


const Dashboard = () => {
    const [stats, setStats] = useState({ 
        totalComics: 0, 
        totalViews: '0', 
        totalUsers: 0, 
        totalChapters: 0, 
        totalRevenue: 0,
        revenueTrend: '0%',
        revenueHistory: [],
        previousRevenueHistory: [],
        topComics: [],
        recentComics: [],
        systemHealth: {
            database: 'Checking...',
            server: 'Active',
            uptime: 0
        }
    });

    const formatUptime = (seconds) => {
        if (!seconds) return '0s';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const d = Math.floor(h / 24);
        const hRemaining = h % 24;
        return d > 0 ? `${d}d ${hRemaining}h` : h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    const [systemStatus, setSystemStatus] = useState('Checking...');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        fetch(`${API_BASE_URL}/stats`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
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
                if (!data) return;
                setStats(data);
                setSystemStatus(data.systemHealth?.server || 'Active');
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching stats:', err);
                setSystemStatus('Offline');
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto mt-32 flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin" />
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest animate-pulse">Syncing Administrative Data...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-12 my-20 px-8">
            <div className="flex justify-between items-end pb-8 border-b border-white/[0.05]">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Analytics Overview</h2>
                    <p className="text-zinc-500 mt-1 text-sm">Real-time performance and financial metrics for your platform.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-white/[0.05] rounded-xl">
                        <div className={`w-2 h-2 rounded-full ${systemStatus === 'Active' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-red-500'} animate-pulse`} />
                        <span className="text-white text-xs font-bold uppercase tracking-wider">Service: {systemStatus}</span>
                    </div>
                    <div className="text-zinc-600 text-xs font-medium bg-zinc-900 px-4 py-2 rounded-xl border border-white/[0.05]">
                        v2.4.0-STABLE
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Platform Revenue"
                    value={stats.totalRevenue}
                    icon={DollarSign}
                    trend={stats.revenueTrend}
                    subtext="Total earnings this period"
                />
                <StatCard
                    title="Total Users"
                    value={stats.totalUsers}
                    icon={Users}
                    subtext="Active platform participants"
                />
                <StatCard
                    title="Comic Views"
                    value={stats.totalViews}
                    icon={Eye}
                    subtext="Accumulated chapter reads"
                />
                <StatCard
                    title="Stored Comics"
                    value={stats.totalComics}
                    icon={Library}
                    subtext="Total number of titles"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <RevenueChart data={stats.revenueHistory} previousData={stats.previousRevenueHistory} />
                
                <div className="bg-zinc-900 shadow-2xl rounded-3xl border border-white/[0.05] p-8 overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
                            <TrendingUp size={20} className="text-rose-500" />
                            Top Performing
                        </h3>
                        <a href="/admin/comics" className="text-rose-500 text-[10px] font-bold uppercase tracking-widest hover:underline px-3 py-1 bg-rose-500/10 rounded-lg">View All</a>
                    </div>
                    <div className="space-y-4">
                        {stats.topComics?.map((comic, i) => (
                            <div key={comic._id} className="flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="relative w-10 h-14 rounded-lg overflow-hidden border border-white/10">
                                        <img src={comic.cover} alt="" className="w-full h-full object-cover" />
                                        <div className="absolute top-0 left-0 bg-rose-500 text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-br-lg">{i + 1}</div>
                                    </div>
                                    <div>
                                        <h4 className="text-white text-sm font-bold truncate max-w-[150px]">{comic.title}</h4>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <div className="w-1 h-1 rounded-full bg-rose-500" />
                                            <span className="text-zinc-500 text-[10px] font-medium tracking-wide">ID: {comic._id.substring(0, 8)}...</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-white text-sm font-bold tabular-nums">{comic.views.toLocaleString()}</div>
                                    <div className="text-zinc-600 text-[8px] font-black uppercase tracking-widest">Views</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-zinc-900 border border-white/[0.05] rounded-3xl p-8">
                    <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-3">
                        <Activity size={18} className="text-rose-500" />
                        Service Status
                    </h3>
                    <div className="space-y-5">
                        <div className="flex justify-between items-center group cursor-default">
                            <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-zinc-700" />
                                Database Node
                            </span>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${stats.systemHealth?.database === 'Healthy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                {stats.systemHealth?.database?.toUpperCase() || 'OFFLINE'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center group cursor-default">
                            <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-zinc-700" />
                                Uptime Counter
                            </span>
                            <span className="text-white text-[9px] font-black uppercase tracking-widest">{formatUptime(stats.systemHealth?.uptime)}</span>
                        </div>
                        <div className="flex justify-between items-center group cursor-default">
                            <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-zinc-700" />
                                Network Secure
                            </span>
                            <div className="flex items-center gap-1.5">
                                <span className="text-emerald-500 text-[9px] font-black uppercase tracking-widest">Active</span>
                                <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-zinc-900 border border-white/[0.05] rounded-3xl p-8 col-span-2">
                    <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-3">
                        <Calendar size={18} className="text-rose-500" />
                        Recently Added
                    </h3>
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                        {stats.recentComics?.map(comic => (
                            <a href={`/comic/${comic._id}`} key={comic._id} className="group flex flex-col gap-2">
                                <div className="aspect-[3/4] rounded-xl overflow-hidden border border-white/5 group-hover:border-rose-500/40 transition-colors">
                                    <img src={comic.cover} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <h4 className="text-white text-[10px] font-bold truncate px-1">{comic.title}</h4>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
