import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Star, Eye, TrendingUp, Filter, ChevronDown, Flame } from 'lucide-react';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import { formatViews } from '../utils/format';
import LazyImage from '../components/LazyImage';

const PopularComicCard = ({ comic }) => {
    return (
        <Link to={`/p/${comic.id || comic._id}`} className="group flex flex-col gap-3">
            <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden shadow-sm transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-[var(--shadow-card)] ring-1 ring-[var(--border)]">
                <LazyImage
                    src={comic.cover_url || comic.cover}
                    alt={comic.title}
                    className="w-full h-full object-cover"
                />
                
                {/* Meta overlay gradient (visible on hover) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <div className="flex gap-4 text-white text-xs font-semibold">
                        <span className="flex items-center gap-1.5"><Eye size={12}/>{formatViews(comic.views)}</span>
                        <span className="flex items-center gap-1.5 text-yellow-400"><Star size={12} fill="currentColor"/>{comic.rating || '—'}</span>
                    </div>
                </div>
            </div>
            <div className="px-1">
                <h3 className="font-bold text-[0.95rem] leading-tight line-clamp-1 transition-colors group-hover:text-[var(--accent)]" style={{ color: 'var(--text-primary)' }}>{comic.title}</h3>
                {comic.genres && comic.genres.length > 0 && (
                    <p className="text-[0.65rem] uppercase font-semibold tracking-widest mt-1.5 line-clamp-1" style={{ color: 'var(--text-secondary)' }}>
                        {comic.genres.map(g => g.name || g).join(' • ')}
                    </p>
                )}
            </div>
        </Link>
    );
};

const PopularPage = () => {
    const [comics, setComics] = useState([]);
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedGenre, setSelectedGenre] = useState('');
    const [sortBy, setSortBy] = useState('views');
    const [showGenreDropdown, setShowGenreDropdown] = useState(false);
    
    // Close dropdown on outside click
    const dropdownRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowGenreDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    useEffect(() => {
        fetchPopularComics();
    }, [selectedGenre, sortBy]);

    const fetchPopularComics = async () => {
        setLoading(true);
        try {
            let url = `http://localhost:5000/api/comics/popular?sort=${sortBy}`;
            if (selectedGenre) {
                url += `&genre=${encodeURIComponent(selectedGenre)}`;
            }
            const response = await fetch(url);
            const data = await response.json();
            setComics(data.comics || []);
            if (data.genres) setGenres(data.genres);
        } catch (error) {
            console.error('Error fetching popular comics:', error);
        } finally {
            setLoading(false);
        }
    };

    const sortOptions = [
        { value: 'views', label: 'Xem Nhiều Nhất', icon: <Eye size={14} /> },
        { value: 'rating', label: 'Đánh Giá Cao', icon: <Star size={14} /> },
        { value: 'newest', label: 'Mới Cập Nhật', icon: <TrendingUp size={14} /> },
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
            <Navbar />

            <main className="flex-1 container mx-auto px-6 pt-24 pb-16 md:pt-32 md:pb-24 max-w-7xl">
                {/* Clean Typography Header */}
                <div className="mb-12 md:mb-16">
                    <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4" style={{ color: 'var(--text-primary)' }}>
                        Truyện <span className="font-bold">Thịnh Hành</span>
                    </h1>
                    <p className="text-sm md:text-base max-w-2xl leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        Khám phá bảng xếp hạng. Những tác phẩm được đọc nhiều nhất và yêu thích nhất bởi cộng đồng chúng tôi.
                    </p>
                </div>

                {/* Sleek Filter Bar */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12 relative z-20">
                    
                    {/* Minimalist Tabs */}
                    <div className="flex items-center gap-3 overflow-x-auto pb-4 md:pb-0 w-full md:w-auto flex-nowrap hide-scrollbar">
                        {sortOptions.map(opt => {
                            const isActive = sortBy === opt.value;
                            return (
                                <button
                                    key={opt.value}
                                    onClick={() => setSortBy(opt.value)}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs uppercase tracking-widest font-bold transition-all whitespace-nowrap shadow-sm border focus:outline-none ${isActive ? 'scale-100' : 'hover:-translate-y-0.5'}`}
                                    style={{
                                        background: isActive ? 'var(--accent)' : 'var(--bg-secondary)',
                                        color: isActive ? '#fff' : 'var(--text-secondary)',
                                        borderColor: isActive ? 'var(--accent)' : 'var(--border)'
                                    }}
                                >
                                    {opt.icon}
                                    <span>{opt.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Genre Dropdown */}
                    <div className="relative w-full md:w-auto" ref={dropdownRef}>
                        <button
                            onClick={() => setShowGenreDropdown(!showGenreDropdown)}
                            className="flex items-center justify-between gap-3 px-6 py-3 rounded-2xl text-xs uppercase tracking-widest font-bold transition-all w-full md:w-56 shadow-sm border focus:outline-none"
                            style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
                        >
                            <span className="flex items-center gap-2">
                                <Filter size={14} style={{ color: 'var(--accent)' }} /> 
                                <span className="truncate max-w-[120px] text-left">{selectedGenre || 'Tất cả Thể loại'}</span>
                            </span>
                            <ChevronDown size={16} className={`transition-transform duration-300 ${showGenreDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {showGenreDropdown && (
                            <div className="absolute top-full right-0 mt-3 w-full md:w-64 rounded-2xl overflow-hidden border shadow-2xl py-2 max-h-80 overflow-y-auto custom-scrollbar" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', zIndex: 50 }}>
                                <button
                                    className="w-full text-left px-6 py-3.5 text-xs font-bold uppercase tracking-widest transition-colors hover:bg-[var(--bg-primary)]"
                                    style={{ color: !selectedGenre ? 'var(--accent)' : 'var(--text-secondary)' }}
                                    onClick={() => { setSelectedGenre(''); setShowGenreDropdown(false); }}
                                >
                                    Tất cả Thể loại
                                </button>
                                {genres.map(g => {
                                    const gName = g.name || g;
                                    const isSelected = selectedGenre === gName;
                                    return (
                                        <button
                                            key={g._id || g}
                                            className="w-full text-left px-6 py-3.5 text-xs font-bold uppercase tracking-widest transition-colors hover:bg-[var(--bg-primary)]"
                                            style={{ color: isSelected ? 'var(--accent)' : 'var(--text-secondary)' }}
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
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 md:gap-x-6 md:gap-y-10">
                    {loading ? (
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
                            <PopularComicCard key={comic._id || comic.id} comic={comic} rank={index + 1} />
                        ))
                    ) : (
                        <div className="col-span-full py-24 flex flex-col items-center justify-center text-center">
                            <Flame size={56} className="mb-6 opacity-30" style={{ color: 'var(--text-secondary)' }} />
                            <h3 className="text-2xl font-light mb-3" style={{ color: 'var(--text-primary)' }}>Không tìm thấy truyện</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>Vui lòng thay đổi bộ lọc hoặc chuyên mục để xem các bộ truyện khác.</p>
                        </div>
                    )}
                </div>
            </main>
            
            <Footer />
        </div>
    );
};

export default PopularPage;
