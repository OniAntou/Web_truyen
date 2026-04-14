import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight, X } from 'lucide-react';
import LazyImage from '../ui/LazyImage';
import { getReadingHistory, clearReadingHistory } from '../../utils/readingHistory';

const ContinueReading = () => {
    const [history, setHistory] = React.useState([]);

    React.useEffect(() => {
        setHistory(getReadingHistory());
    }, []);

    if (history.length === 0) return null;

    const handleClear = () => {
        clearReadingHistory();
        setHistory([]);
    };

    // Only show the 6 most recent
    const displayHistory = history.slice(0, 6);



    return (
        <section className="container mx-auto px-6 py-8 md:py-12 max-w-7xl">
            <div className="flex items-center justify-between mb-6 md:mb-8">
                <div className="flex items-center gap-3">
                    <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(244, 63, 94, 0.1)' }}
                    >
                        <BookOpen size={18} style={{ color: 'var(--accent)' }} />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-light tracking-tight" style={{ color: 'var(--text-primary)' }}>
                        Đọc <span className="font-bold">Tiếp</span>
                    </h2>
                </div>
                <button
                    onClick={handleClear}
                    className="flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase px-3 py-1.5 rounded-lg transition-colors"
                    style={{ color: 'var(--text-secondary)' }}
                    onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent)'}
                    onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                    title="Xóa lịch sử đọc"
                >
                    <X size={14} />
                    Xóa
                </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
                {displayHistory.map(item => (
                    <Link 
                        key={item.comicId} 
                        to={`/read/${item.comicId}/${item.chapterId}`}
                        className="group relative flex flex-col gap-2.5 transition-transform hover:-translate-y-1"
                    >
                        {/* Cover */}
                        <div className="aspect-[2/3] w-full rounded-2xl overflow-hidden ring-1 ring-[var(--border)] relative" style={{ background: 'var(--bg-secondary)' }}>
                            <LazyImage
                                src={item.coverUrl}
                                alt={item.comicTitle}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            {/* Dark gradient overlay at bottom */}
                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
                            
                            {/* Chapter info badge at bottom */}
                            <div className="absolute bottom-0 inset-x-0 p-3">
                                <div className="flex items-center gap-1.5 text-white/90">
                                    <BookOpen size={12} />
                                    <span className="text-xs font-semibold truncate flex items-center gap-1.5">
                                        Ch.{item.chapterNumber}
                                        <span className="w-1 h-1 rounded-full bg-current opacity-30"></span>
                                        <span>Đọc tiếp</span>
                                    </span>

                                </div>
                            </div>

                            {/* Continue overlay on hover */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <div className="flex items-center gap-2 bg-white/90 text-black px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg">
                                    Đọc Tiếp
                                    <ChevronRight size={14} />
                                </div>
                            </div>
                        </div>

                        {/* Title */}
                        <p 
                            className="font-semibold text-xs md:text-sm line-clamp-1 transition-colors group-hover:text-[var(--accent)] px-0.5"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            {item.comicTitle}
                        </p>
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default ContinueReading;
