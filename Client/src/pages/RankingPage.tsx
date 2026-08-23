import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Calendar, Clock } from 'lucide-react';
import { comicService, ComicsResponse } from '../services/comicService';
import ComicCard from '../components/ui/ComicCard';

const RankingPage: React.FC = () => {
    const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week');

    const { data, isLoading } = useQuery<ComicsResponse>({
        queryKey: ['ranking', period],
        queryFn: () => comicService.getRanking(period, 20),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const comics = data?.comics || [];

    const periods = [
        { id: 'week', label: 'Tuần', icon: <Clock size={16} /> },
        { id: 'month', label: 'Tháng', icon: <Calendar size={16} /> },
        { id: 'year', label: 'Năm', icon: <Trophy size={16} /> },
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
            <div className="flex-1 container mx-auto px-4 sm:px-6 pt-24 pb-20 md:pt-32 md:pb-28 max-w-7xl">
                {/* Header */}
                <div className="mb-10 sm:mb-12">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-[0.2em] uppercase bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 mb-3">
                        ★ Hall of Fame
                    </span>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-3 text-[var(--text-primary)]">
                        Bảng <span className="text-[var(--accent)]">Xếp Hạng</span>
                    </h1>
                    <p className="text-sm sm:text-base max-w-2xl leading-relaxed text-[var(--text-secondary)]">
                        Những tác phẩm truyện tranh được yêu thích và đón đọc nhiều nhất trên toàn hệ thống ComicVerse.
                    </p>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-2.5 mb-10 overflow-x-auto pb-2 custom-scrollbar">
                    {periods.map((p) => {
                        const isActive = period === p.id;
                        return (
                            <button
                                key={p.id}
                                onClick={() => setPeriod(p.id as any)}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs uppercase tracking-wider font-bold transition-all duration-300 whitespace-nowrap border focus:outline-none ${
                                    isActive 
                                        ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-md shadow-[var(--accent)]/25 scale-100' 
                                        : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--text-secondary)]'
                                }`}
                            >
                                {p.icon}
                                <span>Top {p.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-5 md:gap-6">
                    {isLoading ? (
                        Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="flex flex-col gap-3">
                                <div className="aspect-[2/3] w-full rounded-2xl animate-pulse bg-[var(--bg-secondary)] border border-[var(--border)]"></div>
                                <div className="px-1 space-y-2">
                                    <div className="h-4 w-3/4 rounded bg-[var(--bg-secondary)] animate-pulse"></div>
                                    <div className="h-3 w-1/2 rounded bg-[var(--bg-secondary)] animate-pulse"></div>
                                </div>
                            </div>
                        ))
                    ) : comics.length > 0 ? (
                        comics.map((comic, index) => (
                            <div key={comic._id || comic.id} className="relative group">
                                {/* Podium Rank Badge */}
                                <div 
                                    className={`absolute -top-2 -left-2 w-8 h-8 rounded-xl flex items-center justify-center z-20 font-black text-xs shadow-lg border border-white/20 ${
                                        index === 0 
                                            ? 'bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 text-amber-950 ring-2 ring-amber-400/50' 
                                            : index === 1 
                                            ? 'bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 text-slate-900 ring-2 ring-slate-300/50' 
                                            : index === 2 
                                            ? 'bg-gradient-to-br from-amber-700 via-amber-800 to-amber-900 text-amber-100 ring-2 ring-amber-700/50' 
                                            : 'bg-[var(--bg-card)] text-[var(--text-primary)] border-[var(--border)]'
                                    }`}
                                >
                                    #{index + 1}
                                </div>
                                <ComicCard comic={comic} />
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center text-center p-8 rounded-3xl border border-dashed border-[var(--border)] bg-[var(--bg-secondary)]">
                            <Trophy size={48} className="mb-4 text-[var(--text-muted)] opacity-40" />
                            <h3 className="text-xl font-bold mb-2 text-[var(--text-primary)]">Đang cập nhật dữ liệu</h3>
                            <p className="text-xs text-[var(--text-secondary)]">Dữ liệu xếp hạng đang được hệ thống tổng hợp. Vui lòng quay lại sau.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RankingPage;
