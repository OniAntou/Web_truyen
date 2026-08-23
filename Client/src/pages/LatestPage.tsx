import React, { useEffect, useState } from 'react';
import { Clock, Filter, ChevronDown, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';


import { comicService, ComicsResponse } from '../services/comicService';
import ComicCard from '../components/ui/ComicCard';
import { Comic, Genre, Pagination } from '../types/comic';

const SkeletonCard: React.FC = () => (
    <div className="flex flex-col gap-3">
        <div className="aspect-[2/3] w-full rounded-2xl animate-pulse bg-[var(--bg-secondary)] border border-[var(--border)]"></div>
        <div className="px-1 space-y-2">
            <div className="h-4 bg-[var(--bg-secondary)] rounded animate-pulse w-3/4"></div>
            <div className="h-3 bg-[var(--bg-secondary)] rounded animate-pulse w-1/2"></div>
        </div>
    </div>
);

const LatestPage: React.FC = () => {
    const [comics, setComics] = useState<Comic[]>([]);
    const [genres, setGenres] = useState<(Genre | string)[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedGenre, setSelectedGenre] = useState('');
    const [showGenreDropdown, setShowGenreDropdown] = useState(false);
    const [pagination, setPagination] = useState<Pagination>({ page: 1, totalPages: 1, total: 0 });

    useEffect(() => {
        fetchLatestComics(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedGenre]);

    const fetchLatestComics = async (page: number) => {
        setLoading(true);
        try {
            const data: ComicsResponse = await comicService.getLatest(page, 18, selectedGenre);
            setComics(data.comics || []);
            if (data.genres) setGenres(data.genres);
            if (data.pagination) setPagination(data.pagination);
        } catch (error) {
            console.error('Error fetching latest comics:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > pagination.totalPages) return;
        fetchLatestComics(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
            <main className="flex-1 container mx-auto px-4 sm:px-6 pt-24 pb-16 md:pt-32 md:pb-24 max-w-7xl">
                {/* Header */}
                <div className="mb-10 sm:mb-12">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-[0.2em] uppercase bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 mb-3">
                        <Clock size={12} /> Cập Nhật Liên Tục
                    </span>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[var(--text-primary)] mb-3">
                        Truyện <span className="text-[var(--accent)]">Mới Cập Nhật</span>
                    </h1>
                    <div className="flex items-center gap-4">
                        <p className="text-sm sm:text-base max-w-2xl leading-relaxed text-[var(--text-secondary)]">
                            Theo dõi ngay những chương truyện và tựa tác phẩm nóng hổi vừa được cập nhật hôm nay.
                        </p>
                        {pagination.total > 0 && (
                            <span className="hidden md:inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border)]">
                                {pagination.total} tác phẩm
                            </span>
                        )}
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between mb-10 w-full rounded-3xl p-3 sm:p-4 bg-[var(--bg-secondary)] border border-[var(--border)] shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 flex items-center justify-center rounded-2xl bg-[var(--bg-primary)] text-[var(--text-secondary)] border border-[var(--border)]">
                            <Filter size={15} />
                        </div>
                        
                        {/* Genre Dropdown */}
                        <div className="relative flex-1 sm:w-56">
                            <button
                                className="w-full flex items-center justify-between px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border)] hover:border-[var(--text-secondary)] transition-colors"
                                onClick={() => setShowGenreDropdown(!showGenreDropdown)}
                            >
                                <span className="truncate pr-2">{selectedGenre || 'Tất Cả Thể Loại'}</span>
                                <ChevronDown size={14} className={`transition-transform duration-300 ${showGenreDropdown ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {showGenreDropdown && (
                                <div className="absolute top-full left-0 mt-2 w-full rounded-3xl overflow-hidden shadow-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-2xl z-50 animate-slide-up-fade">
                                    <div className="max-h-60 overflow-y-auto custom-scrollbar p-2 outline-none">
                                        <button
                                            className={`w-full text-left px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider mb-1 transition-colors ${!selectedGenre ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'}`}
                                            onClick={() => { setSelectedGenre(''); setShowGenreDropdown(false); }}
                                        >
                                            Tất Cả Thể Loại
                                        </button>
                                        {genres.map((g) => {
                                            const gName = typeof g === 'string' ? g : g.name;
                                            const gKey = typeof g === 'string' ? g : (g._id || g.name);
                                            const isSelected = selectedGenre === gName;
                                            return (
                                                <button
                                                    key={gKey}
                                                    className={`w-full text-left px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider mb-1 transition-colors ${isSelected ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'}`}
                                                    onClick={() => { setSelectedGenre(gName); setShowGenreDropdown(false); }}
                                                >
                                                    {gName}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full bg-[var(--bg-primary)] text-[var(--text-secondary)] border border-[var(--border)] self-end sm:self-auto">
                        Trang {pagination.page} / {pagination.totalPages}
                    </div>
                </div>

                {/* Comics Grid */}
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-5 md:gap-6">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                ) : comics.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-5 md:gap-6">
                        {comics.map((comic: Comic) => (
                            <ComicCard key={comic._id || comic.id} comic={comic} showTime={true} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center p-8 rounded-3xl border border-dashed border-[var(--border)] bg-[var(--bg-secondary)]">
                        <div className="w-16 h-16 mb-4 rounded-full flex items-center justify-center bg-[var(--bg-primary)] text-[var(--text-muted)]">
                            <BookOpen size={28} />
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-[var(--text-primary)]">Không có kết quả</h3>
                        <p className="text-xs text-[var(--text-secondary)]">Thử thay đổi bộ lọc tìm kiếm của bạn.</p>
                    </div>
                )}

                {/* Refined Pagination */}
                {!loading && pagination.totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-14 pb-8">
                        <button
                            className="w-10 h-10 flex items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:border-[var(--accent)] disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page <= 1}
                            aria-label="Trang trước"
                        >
                            <ChevronLeft size={16} />
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
                                        <span className="w-8 h-8 flex items-center justify-center font-bold text-[var(--text-muted)]">...</span>
                                    )}
                                    <button
                                        className={`w-10 h-10 flex items-center justify-center rounded-2xl border text-xs font-black transition-all ${
                                            pagination.page === p 
                                                ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-md shadow-[var(--accent)]/30 scale-105' 
                                                : 'bg-[var(--bg-secondary)] border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--accent)]/50'
                                        }`}
                                        onClick={() => handlePageChange(p)}
                                    >
                                        {p}
                                    </button>
                                </React.Fragment>
                            ))}

                        <button
                            className="w-10 h-10 flex items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:border-[var(--accent)] disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page >= pagination.totalPages}
                            aria-label="Trang sau"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </main>

            
        </div>
    );
};

export default LatestPage;
