import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Eye, Clock, Filter, ChevronDown, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import { formatViews } from '../utils/format';
import LazyImage from '../components/ui/LazyImage';
import { comicService } from '../api/comicService';

import ComicCard from '../components/ui/ComicCard';

const SkeletonCard = () => (
    <div className="flex flex-col gap-3">
        <div className="aspect-[2/3] w-full rounded-2xl animate-pulse bg-gray-200 dark:bg-gray-800"></div>
        <div className="px-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-3/4"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-1/2"></div>
        </div>
    </div>
);

const LatestPage = () => {
    const [comics, setComics] = useState([]);
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedGenre, setSelectedGenre] = useState('');
    const [showGenreDropdown, setShowGenreDropdown] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

    useEffect(() => {
        fetchLatestComics(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedGenre]);

    const fetchLatestComics = async (page) => {
        setLoading(true);
        try {
            const data = await comicService.getLatest(page, 18, selectedGenre);
            setComics(data.comics || []);
            if (data.genres) setGenres(data.genres);
            if (data.pagination) setPagination(data.pagination);
        } catch (error) {
            console.error('Error fetching latest comics:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > pagination.totalPages) return;
        fetchLatestComics(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
            <Navbar />

            <main className="flex-1 container mx-auto px-6 pt-24 pb-16 md:pt-32 md:pb-24 max-w-7xl">
                {/* Clean Typography Header */}
                <div className="mb-12 md:mb-16">
                    <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4" style={{ color: 'var(--text-primary)' }}>
                        Truyện <span className="font-bold">Mới Cập Nhật</span>
                    </h1>
                    <div className="flex items-center gap-4">
                        <p className="text-base md:text-lg" style={{ color: 'var(--text-secondary)' }}>
                            Theo dõi ngay những tựa truyện nóng hổi vừa ra lò.
                        </p>
                        <span className="hidden md:inline border-l h-4" style={{ borderColor: 'var(--border)' }}></span>
                        {pagination.total > 0 && (
                            <span className="hidden md:flex items-center gap-2 text-sm font-semibold px-3 py-1 rounded-full border tracking-widest uppercase" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}>
                                <Clock size={12} /> Tổng cộng {pagination.total}
                            </span>
                        )}
                    </div>
                </div>

                {/* Advanced Filter Bar (Glassmorphic) */}
                <div className="relative z-50 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-10 w-full rounded-[1.5rem] p-4 backdrop-blur-xl border shadow-sm" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="w-10 h-10 flex items-center justify-center rounded-full" style={{ background: 'var(--bg-primary)', color: 'var(--text-secondary)' }}>
                            <Filter size={18} />
                        </div>
                        
                        {/* Genre Dropdown */}
                        <div className="relative flex-1 md:w-56">
                            <button
                                className="w-full flex items-center justify-between px-5 py-2.5 rounded-full text-sm font-semibold transition-colors border"
                                style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
                                onClick={() => setShowGenreDropdown(!showGenreDropdown)}
                            >
                                <span className="truncate pr-2">{selectedGenre || 'Tất Cả Thể Loại'}</span>
                                <ChevronDown size={14} className={`transition-transform duration-300 ${showGenreDropdown ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {showGenreDropdown && (
                                <div className="absolute top-full left-0 mt-2 w-full rounded-2xl overflow-hidden shadow-2xl border z-50 animate-fade-in" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border)' }}>
                                    <div className="max-h-60 overflow-y-auto custom-scrollbar p-2 outline-none">
                                        <button
                                            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold mb-1 transition-colors ${!selectedGenre ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
                                            style={{ background: !selectedGenre ? 'var(--accent)' : 'transparent', color: !selectedGenre ? 'white' : 'var(--text-primary)' }}
                                            onClick={() => { setSelectedGenre(''); setShowGenreDropdown(false); }}
                                        >
                                            Tất Cả Thể Loại
                                        </button>
                                        {genres.map(g => (
                                            <button
                                                key={g._id || g}
                                                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold mb-1 transition-colors ${selectedGenre === (g.name || g) ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
                                                style={{ background: selectedGenre === (g.name || g) ? 'var(--accent)' : 'transparent', color: selectedGenre === (g.name || g) ? 'white' : 'var(--text-primary)' }}
                                                onClick={() => { setSelectedGenre(g.name || g); setShowGenreDropdown(false); }}
                                            >
                                                {g.name || g}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full border" style={{ background: 'var(--bg-primary)', color: 'var(--text-secondary)', borderColor: 'var(--border)' }}>
                        Trang {pagination.page} / {pagination.totalPages}
                    </div>
                </div>

                {/* Comics Grid */}
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 md:gap-x-6 md:gap-y-10">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                ) : comics.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 md:gap-x-6 md:gap-y-10">
                        {comics.map(comic => (
                            <ComicCard key={comic._id || comic.id} comic={comic} showTime={true} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-24 h-24 mb-6 rounded-full flex items-center justify-center opacity-50" style={{ background: 'var(--bg-secondary)' }}>
                            <BookOpen size={40} style={{ color: 'var(--text-secondary)' }} />
                        </div>
                        <h3 className="text-2xl font-light tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>Không có kết quả</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Thử thay đổi bộ lọc tìm kiếm của bạn.</p>
                    </div>
                )}

                {/* Refined Pagination */}
                {!loading && pagination.totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-16 pb-8">
                        <button
                            className="w-10 h-10 flex items-center justify-center rounded-xl border transition-all hover:-translate-y-1 disabled:opacity-30 disabled:hover:translate-y-0"
                            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page <= 1}
                        >
                            <ChevronLeft size={18} />
                        </button>

                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                            .filter(p => {
                                const current = pagination.page;
                                return p === 1 || p === pagination.totalPages ||
                                    (p >= current - 1 && p <= current + 1);
                            })
                            .map((p, idx, arr) => (
                                <React.Fragment key={p}>
                                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                                        <span className="w-10 h-10 flex items-center justify-center font-bold opacity-30">...</span>
                                    )}
                                    <button
                                        className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all font-bold text-sm ${pagination.page === p ? 'shadow-lg scale-110' : 'hover:-translate-y-1'}`}
                                        style={{ 
                                            background: pagination.page === p ? 'var(--accent)' : 'var(--bg-secondary)', 
                                            borderColor: pagination.page === p ? 'transparent' : 'var(--border)', 
                                            color: pagination.page === p ? 'white' : 'var(--text-primary)' 
                                        }}
                                        onClick={() => handlePageChange(p)}
                                    >
                                        {p}
                                    </button>
                                </React.Fragment>
                            ))}

                        <button
                            className="w-10 h-10 flex items-center justify-center rounded-xl border transition-all hover:-translate-y-1 disabled:opacity-30 disabled:hover:translate-y-0"
                            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page >= pagination.totalPages}
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default LatestPage;
