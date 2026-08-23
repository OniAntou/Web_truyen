import { useEffect, useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Star, Eye, Filter, ChevronDown, Flame } from 'lucide-react';
import { comicService, ComicsResponse } from '../services/comicService';
import ComicCard from '../components/ui/ComicCard';
import { Comic, Genre } from '../types/comic';

const PopularPage: React.FC = () => {
    const [selectedGenre, setSelectedGenre] = useState('');
    const [sortBy, setSortBy] = useState('views');
    const [showGenreDropdown, setShowGenreDropdown] = useState(false);
    // Close dropdown on outside click
    const dropdownRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowGenreDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    const { data, isLoading: loading } = useQuery<ComicsResponse>({
        queryKey: ['popularComics', sortBy, selectedGenre],
        queryFn: () => comicService.getPopular(sortBy, 12, selectedGenre),
    });

    const comics = data?.comics || [];
    const genres = data?.genres || [];

    const sortOptions = [
        { value: 'views', label: 'Xem Nhiều Nhất', icon: <Eye size={14} /> },
        { value: 'rating', label: 'Đánh Giá Cao', icon: <Star size={14} /> },
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
            <div className="flex-1 container mx-auto px-4 sm:px-6 pt-24 pb-20 md:pt-32 md:pb-28 max-w-7xl">
                {/* Header */}
                <div className="mb-10 sm:mb-12">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-[0.2em] uppercase bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 mb-3">
                        <Flame size={12} /> Bảng Khám Phá
                    </span>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[var(--text-primary)] mb-3">
                        Truyện <span className="text-[var(--accent)]">Thịnh Hành</span>
                    </h1>
                    <p className="text-sm sm:text-base max-w-2xl leading-relaxed text-[var(--text-secondary)]">
                        Những tác phẩm truyện tranh nhận được nhiều lượt đọc và lượt đánh giá cao nhất từ cộng đồng ComicVerse.
                    </p>
                </div>

                {/* Filter Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-10 relative z-20">
                    
                    {/* Minimalist Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto flex-nowrap custom-scrollbar">
                        {sortOptions.map(opt => {
                            const isActive = sortBy === opt.value;
                            return (
                                <button
                                    key={opt.value}
                                    onClick={() => setSortBy(opt.value)}
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs uppercase tracking-wider font-bold transition-all duration-300 whitespace-nowrap border focus:outline-none ${
                                        isActive 
                                            ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-md shadow-[var(--accent)]/25 scale-100' 
                                            : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--text-secondary)]'
                                    }`}
                                >
                                    {opt.icon}
                                    <span>{opt.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Genre Dropdown */}
                    <div className="relative w-full sm:w-auto" ref={dropdownRef}>
                        <button
                            onClick={() => setShowGenreDropdown(!showGenreDropdown)}
                            className="flex items-center justify-between gap-3 px-5 py-2.5 rounded-full text-xs uppercase tracking-wider font-bold transition-all w-full sm:w-56 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border)] hover:border-[var(--text-secondary)] shadow-sm focus:outline-none"
                        >
                            <span className="flex items-center gap-2">
                                <Filter size={13} className="text-[var(--accent)]" /> 
                                <span className="truncate max-w-[120px] text-left">{selectedGenre || 'Tất cả Thể loại'}</span>
                            </span>
                            <ChevronDown size={15} className={`transition-transform duration-300 ${showGenreDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {showGenreDropdown && (
                            <div className="absolute top-full right-0 mt-2 w-full sm:w-64 rounded-3xl overflow-hidden border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-2xl shadow-2xl py-2 max-h-80 overflow-y-auto custom-scrollbar z-50 animate-slide-up-fade">
                                <button
                                    className={`w-full text-left px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors hover:bg-[var(--bg-secondary)] ${
                                        !selectedGenre ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'
                                    }`}
                                    onClick={() => { setSelectedGenre(''); setShowGenreDropdown(false); }}
                                >
                                    Tất cả Thể loại
                                </button>
                                {genres.map((g: string | Genre) => {
                                    const gName = typeof g === 'string' ? g : g.name;
                                    const gKey = typeof g === 'string' ? g : (g._id || g.name);
                                    const isSelected = selectedGenre === gName;
                                    return (
                                        <button
                                            key={gKey}
                                            className={`w-full text-left px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors hover:bg-[var(--bg-secondary)] ${
                                                isSelected ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'
                                            }`}
                                            onClick={() => { setSelectedGenre(gName); setShowGenreDropdown(false); }}
                                        >
                                            {gName}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-5 md:gap-6">
                    {loading ? (
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
                        comics.map((comic: Comic) => (
                            <ComicCard key={comic._id || comic.id} comic={comic} />
                        ))
                    ) : (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center text-center p-8 rounded-3xl border border-dashed border-[var(--border)] bg-[var(--bg-secondary)]">
                            <Flame size={48} className="mb-4 text-[var(--text-muted)] opacity-40" />
                            <h3 className="text-xl font-bold mb-2 text-[var(--text-primary)]">Không tìm thấy truyện</h3>
                            <p className="text-xs text-[var(--text-secondary)]">Vui lòng thay đổi bộ lọc hoặc chuyên mục để xem các bộ truyện khác.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PopularPage;
