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
            <div className="flex-1 container mx-auto px-6 pt-24 pb-24 md:pt-32 md:pb-32 max-w-7xl">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4" style={{ color: 'var(--text-primary)' }}>
                        Bảng <span className="font-bold">Xếp Hạng</span>
                    </h1>
                    <p className="text-sm md:text-base max-w-2xl leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        Những bộ truyện được quan tâm nhiều nhất trong cộng đồng theo thời gian.
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-3 mb-12 overflow-x-auto pb-2 hide-scrollbar">
                    {periods.map((p) => {
                        const isActive = period === p.id;
                        return (
                            <button
                                key={p.id}
                                onClick={() => setPeriod(p.id as any)}
                                className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl text-xs uppercase tracking-widest font-bold transition-all whitespace-nowrap shadow-sm border focus:outline-none ${isActive ? 'scale-100' : 'hover:-translate-y-0.5'}`}
                                style={{
                                    background: isActive ? 'var(--accent)' : 'var(--bg-secondary)',
                                    color: isActive ? '#fff' : 'var(--text-secondary)',
                                    borderColor: isActive ? 'var(--accent)' : 'var(--border)'
                                }}
                            >
                                {p.icon}
                                <span>Top {p.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-x-6 md:gap-y-12">
                    {isLoading ? (
                        Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="flex flex-col gap-4">
                                <div className="aspect-[2/3] w-full rounded-2xl animate-pulse ring-1 ring-[var(--border)]" style={{ background: 'var(--bg-secondary)' }}></div>
                                <div className="px-1 space-y-2">
                                    <div className="h-4 w-3/4 rounded animate-pulse" style={{ background: 'var(--bg-secondary)' }}></div>
                                    <div className="h-3 w-1/2 rounded animate-pulse" style={{ background: 'var(--bg-secondary)' }}></div>
                                </div>
                            </div>
                        ))
                    ) : comics.length > 0 ? (
                        comics.map((comic, index) => (
                            <div key={comic._id || comic.id} className="relative">
                                {/* Rank Badge */}
                                <div 
                                    className="absolute -top-2 -left-2 w-8 h-8 rounded-lg flex items-center justify-center z-20 font-black text-sm shadow-xl border border-white/10"
                                    style={{ 
                                        background: index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : index === 2 ? '#b45309' : 'var(--bg-card)',
                                        color: index < 3 ? '#000' : 'var(--text-primary)'
                                    }}
                                >
                                    {index + 1}
                                </div>
                                <ComicCard comic={comic} />
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-24 flex flex-col items-center justify-center text-center">
                            <Trophy size={56} className="mb-6 opacity-30" style={{ color: 'var(--text-secondary)' }} />
                            <h3 className="text-2xl font-light mb-3" style={{ color: 'var(--text-primary)' }}>Đang cập nhật dữ liệu</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>Dữ liệu xếp hạng đang được hệ thống tổng hợp. Vui lòng quay lại sau.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RankingPage;
