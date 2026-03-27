import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Star, Eye, BookOpen, Search, X, Layers } from 'lucide-react';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import { formatViews } from '../utils/format';
import LazyImage from '../components/ui/LazyImage';
import { comicService } from '../api/comicService';

const GenreCard = ({ genre, isSelected, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center justify-start gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group outline-none ${
                isSelected 
                    ? 'bg-[var(--accent)] text-white shadow-md shadow-[var(--accent)]/20' 
                    : 'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)] border border-transparent hover:border-[var(--border)]'
            }`}
        >
            <div className={`w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-300 ${
                isSelected 
                    ? 'bg-white scale-125' 
                    : 'bg-current opacity-30 group-hover:bg-[var(--accent)] group-hover:opacity-100 group-hover:scale-125'
            }`} />
            <span className={`text-sm tracking-wide truncate ${isSelected ? 'font-bold' : 'font-semibold'}`}>
                {genre.name}
            </span>
        </button>
    );
};

const ChevronRightIcon = ({ size, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="9 18 15 12 9 6"></polyline></svg>
);

const ComicCard = ({ comic }) => {
    return (
        <Link to={`/p/${comic.id || comic._id}`} className="group flex flex-col gap-3">
            <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden shadow-sm transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-[var(--shadow-card)] ring-1 ring-[var(--border)] bg-[var(--bg-secondary)]">
                <LazyImage
                    src={comic.cover_url || comic.cover}
                    alt={comic.title}
                    className="w-full h-full object-cover"
                />

                {/* Meta overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <div className="flex gap-4 text-white text-xs font-semibold">
                        <span className="flex items-center gap-1.5"><Eye size={12}/>{formatViews(comic.views)}</span>
                        <span className="flex items-center gap-1.5 text-yellow-500"><Star size={12} fill="currentColor"/>{comic.rating || '—'}</span>
                    </div>
                </div>
            </div>
            <div className="px-1 flex flex-col gap-1.5">
                <h3 className="font-bold text-[0.95rem] leading-tight line-clamp-1 transition-colors group-hover:text-[var(--accent)]" style={{ color: 'var(--text-primary)' }}>{comic.title}</h3>
                
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[0.7rem] font-semibold tracking-wide uppercase" style={{ color: 'var(--text-secondary)' }}>
                        <Eye size={12} strokeWidth={2.5} />
                        <span>{formatViews(comic.views)} view</span>
                    </div>
                    {comic.genres && comic.genres.length > 0 && (
                        <p className="text-[0.65rem] uppercase font-bold tracking-widest line-clamp-1 opacity-50" style={{ color: 'var(--accent)' }}>
                            {comic.genres[0].name || comic.genres[0]}
                        </p>
                    )}
                </div>
            </div>
        </Link>
    );
};

const SkeletonCard = () => (
    <div className="flex flex-col gap-3">
        <div className="aspect-[2/3] w-full rounded-2xl animate-pulse bg-gray-200 dark:bg-gray-800"></div>
        <div className="px-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-3/4"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-1/2"></div>
        </div>
    </div>
);

const GenresPage = () => {
    const [genres, setGenres] = useState([]);
    const [comics, setComics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [comicsLoading, setComicsLoading] = useState(false);
    const [selectedGenre, setSelectedGenre] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchGenres();
    }, []);

    useEffect(() => {
        fetchComicsByGenre();
    }, [selectedGenre]);

    const fetchGenres = async () => {
        setLoading(true);
        try {
            const data = await comicService.getGenres();
            setGenres(data.genres || []);
        } catch (error) {
            console.error('Error fetching genres:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchComicsByGenre = async () => {
        setLoadingComics(true);
        try {
            const data = await comicService.getAll(selectedGenre === 'All' ? '' : selectedGenre);
            setComics(data.comics || []);
        } catch (error) {
            console.error('Error fetching comics:', error);
        } finally {
            setLoadingComics(false);
        }
    };

    const filteredGenres = genres.filter(g =>
        g.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleGenreClick = (genreName) => {
        if (selectedGenre === genreName) {
            setSelectedGenre(null);
        } else {
            setSelectedGenre(genreName);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
            <Navbar />

            <main className="flex-1 container mx-auto px-6 pt-24 pb-16 md:pt-32 md:pb-24 max-w-7xl">
                {/* Clean Typography Header */}
                <div className="mb-10 md:mb-14">
                    <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4" style={{ color: 'var(--text-primary)' }}>
                        Khám Phá <span className="font-bold">Thể Loại</span>
                    </h1>
                    <div className="flex items-center gap-4">
                        <p className="text-base md:text-lg" style={{ color: 'var(--text-secondary)' }}>
                            Bầu trời vô tận của những chuyến phiêu lưu, tìm kiếm chủ đề bạn yêu thích nhất.
                        </p>
                        <span className="hidden md:inline border-l h-4" style={{ borderColor: 'var(--border)' }}></span>
                        {!loading && genres.length > 0 && (
                            <span className="hidden md:flex items-center gap-2 text-sm font-semibold px-3 py-1 rounded-full border tracking-widest uppercase" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}>
                                <Layers size={14} /> {genres.length} Thể Loại
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-10 xl:gap-14 relative items-start">
                    
                    {/* Left Sidebar: Genres Filter & List */}
                    <div className="w-full lg:w-1/3 xl:w-[380px] shrink-0 sticky top-24">
                        {/* Search Bar */}
                        <div className="relative flex items-center w-full mb-6">
                            <Search size={18} className="absolute left-5 pointer-events-none" style={{ color: 'var(--text-secondary)' }} />
                            <input
                                type="text"
                                placeholder="Tìm kiếm thể loại..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full py-4 pl-12 pr-12 rounded-[1.5rem] font-semibold text-sm transition-shadow outline-none border focus:ring-2"
                                style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'var(--border)', '--tw-ring-color': 'var(--accent)' }}
                            />
                            {searchQuery && (
                                <button 
                                    className="absolute right-4 w-6 h-6 rounded-full flex items-center justify-center transition-colors hover:bg-white/10" 
                                    onClick={() => setSearchQuery('')}
                                    style={{ color: 'var(--text-secondary)' }}
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        {/* Genres Grid/List */}
                        <div className="bg-[var(--bg-secondary)] border-[var(--border)] border rounded-[2rem] p-4 shadow-sm max-h-[600px] overflow-y-auto custom-scrollbar">
                            {loading ? (
                                <div className="space-y-3">
                                    {Array.from({ length: 8 }).map((_, i) => (
                                        <div key={i} className="h-16 rounded-[1.5rem] animate-pulse bg-gray-200 dark:bg-gray-800 w-full"></div>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                                    {filteredGenres.map(genre => (
                                        <GenreCard
                                            key={genre.name}
                                            genre={genre}
                                            isSelected={selectedGenre === genre.name}
                                            onClick={() => handleGenreClick(genre.name)}
                                        />
                                    ))}
                                    {filteredGenres.length === 0 && (
                                        <div className="py-12 flex flex-col items-center justify-center text-center opacity-50">
                                            <Search size={32} className="mb-4" />
                                            <p className="font-semibold text-sm">Không tìm thấy "{searchQuery}"</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Panel: Comics Display */}
                    <div className="flex-1 min-w-0 w-full">
                        {selectedGenre ? (
                            <div className="animate-fade-in w-full">
                                <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--border)]">
                                    <h2 className="text-2xl md:text-3xl font-light tracking-tight" style={{ color: 'var(--text-primary)' }}>
                                        Tuyển tập <span className="font-bold" style={{ color: 'var(--accent)' }}>{selectedGenre}</span>
                                    </h2>
                                    <button
                                        onClick={() => setSelectedGenre(null)}
                                        className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase transition-colors border shadow-sm hover:opacity-80"
                                        style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', borderColor: 'var(--border)' }}
                                    >
                                        <X size={14} />
                                        Bỏ Phân Loại
                                    </button>
                                </div>

                                {comicsLoading ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-x-6 md:gap-y-10">
                                        {Array.from({ length: 8 }).map((_, i) => (
                                            <SkeletonCard key={i} />
                                        ))}
                                    </div>
                                ) : comics.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-x-6 md:gap-y-10">
                                        {comics.map(comic => (
                                            <ComicCard key={comic._id || comic.id} comic={comic} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-24 flex flex-col items-center justify-center text-center border rounded-[2rem] border-dashed" style={{ borderColor: 'var(--border)' }}>
                                        <BookOpen size={48} className="mb-4 opacity-20" style={{ color: 'var(--text-secondary)' }} />
                                        <h3 className="text-xl font-light mb-2" style={{ color: 'var(--text-primary)' }}>Thể loại này đang trống</h3>
                                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Hiện chưa có bộ truyện nào thuộc thể loại này.</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="hidden lg:flex flex-col items-center justify-center h-full min-h-[500px] border border-dashed rounded-[2rem] p-10 text-center animate-fade-in" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
                                <div className="w-24 h-24 mb-6 rounded-full flex items-center justify-center opacity-30 shadow-inner" style={{ background: 'var(--bg-primary)' }}>
                                    <Layers size={40} style={{ color: 'var(--text-secondary)' }} />
                                </div>
                                <h3 className="text-2xl font-light tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>Lựa Chọn Thể Loại</h3>
                                <p className="text-sm max-w-sm" style={{ color: 'var(--text-secondary)' }}>Nhấp vào một phân loại truyện bất kỳ ở danh sách thả xuống bên trái để xem các bộ truyện trực thuộc.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default GenresPage;
