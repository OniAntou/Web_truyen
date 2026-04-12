import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { BookOpen, Clock, ChevronRight, Trash2, History } from 'lucide-react';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import LazyImage from '../components/ui/LazyImage';
import { clearReadingHistory } from '../utils/readingHistory';
import { comicService } from '../api/comicService';

const HistoryPage = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            navigate('/auth');
            return;
        }

        const fetchHistory = async () => {
            setLoading(true);
            try {
                const data = await comicService.getUserReadingHistory(token);
                // Map backend data format to component format
                const mappedHistory = (data || []).map(item => ({
                    comicId: item.comic_id,
                    comicTitle: item.comic_title,
                    coverUrl: item.comic_cover,
                    chapterId: item.chapter_id,
                    chapterTitle: item.chapter_title,
                    chapterNumber: item.chapter_number,
                    timestamp: new Date(item.updated_at).getTime()
                }));
                setHistory(mappedHistory);
            } catch (err) {
                console.error('Error fetching history:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [navigate, token]);

    const handleClear = () => {
        if (!window.confirm('Xóa toàn bộ lịch sử đọc truyện?')) return;
        clearReadingHistory();
        setHistory([]);
    };

    const handleRemoveOne = (comicId) => {
        const updated = history.filter(item => item.comicId !== comicId);
        setHistory(updated);
        localStorage.setItem('comicverse_reading_history', JSON.stringify(updated));
    };

    const timeAgo = (timestamp) => {
        const diff = Date.now() - timestamp;
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return 'Vừa xong';
        if (minutes < 60) return `${minutes} phút trước`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} giờ trước`;
        const days = Math.floor(hours / 24);
        if (days < 30) return `${days} ngày trước`;
        return `${Math.floor(days / 30)} tháng trước`;
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
            <Helmet>
                <title>Lịch Sử Đọc Truyện | ComicVerse</title>
                <meta name="description" content="Xem lại lịch sử đọc truyện của bạn trên ComicVerse." />
            </Helmet>
            <Navbar />

            <main className="flex-1 container mx-auto px-6 pt-24 pb-16 md:pt-32 md:pb-24 max-w-7xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-12 md:mb-16">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-3" style={{ color: 'var(--text-primary)' }}>
                            Lịch Sử <span className="font-bold">Đọc Truyện</span>
                        </h1>
                        <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
                            {history.length > 0
                                ? `Bạn đã đọc ${history.length} bộ truyện gần đây.`
                                : 'Chưa có lịch sử đọc truyện nào.'
                            }
                        </p>
                    </div>
                    {history.length > 0 && (
                        <button
                            onClick={handleClear}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-all border"
                            style={{ 
                                background: 'rgba(239, 68, 68, 0.08)', 
                                color: '#ef4444', 
                                borderColor: 'rgba(239, 68, 68, 0.2)' 
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'; }}
                        >
                            <Trash2 size={14} />
                            Xóa tất cả
                        </button>
                    )}
                </div>

                {/* History Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <div className="search-spinner mb-4" style={{ width: '40px', height: '40px' }}></div>
                        <p style={{ color: 'var(--text-secondary)' }}>Đang tải lịch sử...</p>
                    </div>
                ) : history.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 md:gap-x-6 md:gap-y-8">
                        {history.map(item => (
                            <div key={item.comicId} className="group relative flex flex-col gap-2.5">
                                <Link 
                                    to={`/p/${item.comicId}`}
                                    className="block transition-transform hover:-translate-y-1"
                                >
                                    {/* Cover */}
                                    <div className="aspect-[2/3] w-full rounded-2xl overflow-hidden ring-1 ring-[var(--border)] relative" style={{ background: 'var(--bg-secondary)' }}>
                                        <LazyImage
                                            src={item.coverUrl}
                                            alt={item.comicTitle}
                                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        {/* Gradient overlay */}
                                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
                                        
                                        {/* Chapter badge */}
                                        <div className="absolute bottom-0 inset-x-0 p-3">
                                            <div className="flex items-center gap-1.5 text-white/90">
                                                <BookOpen size={12} />
                                                <span className="text-xs font-semibold truncate">
                                                    Ch.{item.chapterNumber} — {item.chapterTitle}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 mt-1 text-white/50">
                                                <Clock size={10} />
                                                <span className="text-[10px] font-medium">{timeAgo(item.timestamp)}</span>
                                            </div>
                                        </div>

                                        {/* Continue overlay */}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                            <div className="flex items-center gap-2 bg-white/90 text-black px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg">
                                                Đọc Tiếp
                                                <ChevronRight size={14} />
                                            </div>
                                        </div>
                                    </div>
                                </Link>

                                {/* Title + Chapter */}
                                <div className="px-0.5">
                                    <Link to={`/p/${item.comicId}`}>
                                        <p 
                                            className="font-semibold text-sm md:text-base line-clamp-1 transition-colors hover:text-[var(--accent)]"
                                            style={{ color: 'var(--text-primary)' }}
                                        >
                                            {item.comicTitle}
                                        </p>
                                    </Link>
                                    <p className="text-xs md:text-sm mt-0.5 line-clamp-1" style={{ color: 'var(--text-secondary)' }}>
                                        Ch.{item.chapterNumber} · {timeAgo(item.timestamp)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div 
                            className="w-28 h-28 mb-8 rounded-full flex items-center justify-center opacity-40"
                            style={{ background: 'var(--bg-secondary)' }}
                        >
                            <History size={48} style={{ color: 'var(--text-secondary)' }} />
                        </div>
                        <h3 className="text-2xl font-light tracking-tight mb-3" style={{ color: 'var(--text-primary)' }}>
                            Chưa có lịch sử
                        </h3>
                        <p className="mb-8 max-w-md" style={{ color: 'var(--text-secondary)' }}>
                            Bắt đầu đọc truyện và lịch sử sẽ tự động được lưu lại ở đây để bạn có thể tiếp tục bất cứ lúc nào.
                        </p>
                        <Link 
                            to="/latest" 
                            className="px-8 py-3 rounded-2xl font-bold text-sm transition-all uppercase tracking-wider"
                            style={{ background: 'var(--accent)', color: 'white' }}
                        >
                            Khám Phá Truyện
                        </Link>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default HistoryPage;
