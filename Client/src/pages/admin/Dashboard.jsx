import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
    <div className="bg-[#141414] p-6 rounded-xl border border-white/5 hover:border-white/10 transition-colors duration-200 group relative">
        <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-rose-500/10 border border-rose-500/20 text-rose-500 group-hover:scale-110 transition-transform duration-300">
                    <Icon size={24} strokeWidth={2} />
                </div>
                {trend && (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                        <ArrowUpRight size={10} />
                        {trend}
                    </div>
                )}
            </div>
            
            <h3 className="text-zinc-300 text-xs font-bold uppercase tracking-wider mb-2">{title}</h3>
            <div className="flex items-baseline gap-1.5">
                <p className="text-4xl font-bold text-white tabular-nums">
                    {typeof value === 'number' && (title.includes('Revenue') || title.includes('Capital'))
                        ? value.toLocaleString('vi-VN') 
                        : value}
                </p>
                {(title.includes('Revenue') || title.includes('Capital')) && <span className="text-zinc-300 text-sm font-medium">VND</span>}
            </div>
            <p className="text-xs text-zinc-300 mt-2 font-medium tracking-wide italic">
                {subtext}
            </p>
        </div>
    </div>
);

const RevenueChart = ({ data, previousData }) => {
    const [hoveredIdx, setHoveredIdx] = useState(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
    const chartContainerRef = React.useRef(null);
    const [containerWidth, setContainerWidth] = useState(0);

    React.useEffect(() => {
        if (!chartContainerRef.current) return;
        const observer = new ResizeObserver(([entry]) => {
            setContainerWidth(entry.contentRect.width);
        });
        observer.observe(chartContainerRef.current);
        return () => observer.disconnect();
    }, []);

    if (!data || data.length === 0) return null;

    const maxCurrent = Math.max(...data.map(d => d.amount), 1);
    const maxPrev = previousData ? Math.max(...previousData.map(d => d.amount), 1) : 1;
    const rawMax = Math.max(maxCurrent, maxPrev, 1);
    
    // Round up to a nice clean number for scaling
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawMax)));
    const maxAmount = Math.ceil(rawMax / magnitude) * magnitude;
    
    // Format large numbers with K, M, B abbreviations
    const formatYValue = (val) => {
        if (val >= 1000000000) return (val / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
        if (val >= 1000000) return (val / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        if (val >= 1000) return (val / 1000).toFixed(0) + 'K';
        return val.toString();
    };
    
    const chartHeight = 260;
    const chartWidth = Math.max(containerWidth || 1050, 1050);
    const paddingX = 80; // Increased padding to prevent label clipping
    const paddingY = 35;
    
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
            // Further reduce curvature
            const cp1x = p0.x + (p1.x - p0.x) * 0.05;
            const cp2x = p1.x - (p1.x - p0.x) * 0.05;
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
        <div className="bg-[#141414] rounded-2xl border border-white/5 p-8 relative overflow-hidden">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">Revenue Trend</h3>
                    <p className="text-zinc-300 text-sm mt-1">Daily platform revenue analysis</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-bold text-zinc-200 uppercase tracking-widest">Current</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-zinc-700" />
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Previous</span>
                    </div>
                </div>
            </div>

            <div ref={chartContainerRef} className="relative h-[280px] w-full">
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
                            <div className="bg-zinc-950/95 border border-emerald-500/20 p-2 rounded-lg shadow-lg backdrop-blur-sm min-w-[120px]">
                                <div className="text-zinc-200 text-[9px] uppercase tracking-wide mb-0.5">
                                    {new Date(data[hoveredIdx].date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
                                </div>
                                <div className="text-emerald-400 font-bold text-xs tracking-tight">
                                    {data[hoveredIdx].amount.toLocaleString('vi-VN')} VND
                                </div>
                            </div>
                        </div>
                        <div className="absolute z-20 w-2 h-2 bg-emerald-500 rounded-full"
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
                        <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#059669" />
                        </linearGradient>
                    </defs>
                    
                    {/* Grid lines and Y-axis labels */}
                    {[0, 0.2, 0.4, 0.6, 0.8, 1].map(i => (
                        <React.Fragment key={`grid-${i}`}>
                            <line 
                                x1={paddingX}
                                y1={paddingY + i * (chartHeight - paddingY * 2)}
                                x2={chartWidth - paddingX}
                                y2={paddingY + i * (chartHeight - paddingY * 2)}
                                stroke="white"
                                strokeOpacity="0.08"
                                strokeWidth="1"
                            />
                            <text
                                x={paddingX - 15}
                                y={paddingY + i * (chartHeight - paddingY * 2)}
                                fill="#71717a"
                                fontSize="12"
                                textAnchor="end"
                                alignmentBaseline="middle"
                                dominantBaseline="middle"
                                className="font-mono font-medium"
                            >
                                {formatYValue(Math.round(maxAmount * (1 - i)))}
                            </text>
                        </React.Fragment>
                    ))}
                    
                    {/* Vertical grid lines */}
                    {data.map((_, i) => (
                        <line 
                            key={i}
                            x1={paddingX + (i / (data.length - 1)) * (chartWidth - paddingX * 2)}
                            y1={paddingY}
                            x2={paddingX + (i / (data.length - 1)) * (chartWidth - paddingX * 2)}
                            y2={chartHeight - paddingY}
                            stroke="white"
                            strokeOpacity="0.05"
                            strokeWidth="1"
                        />
                    ))}

                    <path d={areaD} fill="none" />

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
                        stroke="url(#lineGradient)" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                    />

                    {hoveredIdx !== null && (
                        <g>
                            <line 
                                x1={tooltipPos.x} y1="0" x2={tooltipPos.x} y2={chartHeight}
                                stroke="#10b981" strokeOpacity="0.2" strokeWidth="1"
                            />
                            <circle 
                                cx={tooltipPos.x} cy={tooltipPos.y} r="3"
                                fill="#10b981" 
                            />
                        </g>
                    )}
                    {/* X-axis labels */}
                    {data.map((d, i) => {
                        const xPos = paddingX + (i / (data.length - 1)) * (chartWidth - paddingX * 2);
                        const isHovered = hoveredIdx === i;
                        return (
                            <g key={`x-label-${i}`}>
                                <text
                                    x={xPos}
                                    y={chartHeight - 12}
                                    fill="currentColor"
                                    className={`text-[11px] font-bold uppercase tracking-wider transition-colors duration-300 pointer-events-none ${isHovered ? 'text-emerald-500' : 'text-zinc-200'}`}
                                    textAnchor="middle"
                                >
                                    {new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })}
                                </text>
                                {isHovered && (
                                    <circle 
                                        cx={xPos} 
                                        cy={chartHeight - 2} 
                                        r="2" 
                                        fill="#10b981" 
                                    />
                                )}
                            </g>
                        );
                    })}
                </svg>
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
                <div className="w-12 h-12 border-2 border-zinc-800 border-t-white rounded-full animate-spin" />
                <p className="text-zinc-300 text-xs font-bold uppercase tracking-widest">Loading Dashboard</p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-10 my-4">
            <div className="flex justify-between items-end pb-8 border-b border-white/5">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Analytics Overview</h2>
                    <p className="text-zinc-300 mt-1 text-base font-medium">Core platform metrics and performance trends.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-black border border-white/5 rounded-xl">
                        <div className={`w-1.5 h-1.5 rounded-full ${systemStatus === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        <span className="text-zinc-200 text-xs font-bold uppercase tracking-widest">{systemStatus}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2">
                    <RevenueChart data={stats.revenueHistory} previousData={stats.previousRevenueHistory} />
                </div>
                <div className="bg-[#141414] rounded-2xl border border-white/5 p-8 overflow-hidden relative">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
                            <TrendingUp size={20} className="text-red-500" />
                            Top Performing
                        </h3>
                        <Link to="/admin/comics" className="text-zinc-300 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors">All</Link>
                    </div>
                    <div className="space-y-4">
                        {stats.topComics?.map((comic, i) => (
                            <Link to={`/admin/comics/edit/${comic._id}`} key={comic._id} className="flex items-center justify-between group p-2 hover:bg-white/[0.03] rounded-xl transition-all duration-300">
                                <div className="flex items-center gap-4">
                                    <div className="relative w-12 h-16 rounded-lg overflow-hidden border border-white/10 shadow-2xl">
                                        <img src={comic.cover} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        <div className="absolute top-0 left-0 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-br-lg shadow-lg">{i + 1}</div>
                                    </div>
                                    <div>
                                        <h4 className="text-white text-base font-bold truncate max-w-[150px] group-hover:text-red-500 transition-colors">{comic.title}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-zinc-300 text-[10px] font-bold uppercase tracking-widest">Analytics</span>
                                            <span className="w-1 h-1 rounded-full bg-zinc-800"></span>
                                            <span className="text-emerald-400 text-xs font-bold">{comic.views.toLocaleString()} views</span>
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight size={16} className="text-zinc-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                            </Link>
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
                            <span className="text-zinc-200 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-zinc-700" />
                                Database Node
                            </span>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${stats.systemHealth?.database === 'Healthy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                {stats.systemHealth?.database?.toUpperCase() || 'OFFLINE'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center group cursor-default">
                            <span className="text-zinc-200 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-zinc-700" />
                                Uptime Counter
                            </span>
                            <span className="text-white text-[9px] font-black uppercase tracking-widest">{formatUptime(stats.systemHealth?.uptime)}</span>
                        </div>
                        <div className="flex justify-between items-center group cursor-default">
                            <span className="text-zinc-200 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
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
                            <Link to={`/admin/comics/edit/${comic._id}`} key={comic._id} className="group flex flex-col gap-3">
                                <div className="aspect-[3/4] rounded-xl overflow-hidden border border-white/5 group-hover:border-white/20 transition-all duration-500">
                                    <img src={comic.cover} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                </div>
                                <div className="px-1">
                                    <h4 className="text-zinc-50 text-[11px] font-bold truncate group-hover:text-white transition-colors">{comic.title}</h4>
                                    <p className="text-zinc-400 text-[9px] font-medium uppercase tracking-tighter mt-0.5">Newly Added</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
