import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, BookOpen, Clock, Edit, Eye, Star, LogOut, Home, LayoutDashboard, Trash2 } from 'lucide-react';
import LazyImage from '../components/ui/LazyImage';
import { API_BASE_URL } from '../constants/api';
import { clearSession } from '../utils/auth';

const CreatorStudio = () => {
    const [comics, setComics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Add a check in a real app to ensure role === 'creator' from context
        fetch(`${API_BASE_URL}/studio/comics`, {
            credentials: 'include'
        })
        .then(res => {
            if (res.status === 401) {
                clearSession();
                return null;
            }
            if (res.status === 403) {
                throw new Error('Bạn không có quyền truy cập trang này. Vui lòng nộp đơn xin cấp quyền tác giả.');
            }
            return res.json();
        })
        .then(data => {
            if (Array.isArray(data)) {
                setComics(data);
            } else {
                throw new Error(data.message || 'Lỗi tải dữ liệu');
            }
            setLoading(false);
        })
        .catch(err => {
            setError(err.message);
            setLoading(false);
        });
    }, [navigate]);

    const handleDeleteComic = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa truyện này? Hành động này không thể hoàn tác.')) return;
        
        try {
            const res = await fetch(`${API_BASE_URL}/comics/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (res.ok) {
                setComics(comics.filter(c => (c._id || c.id) !== id));
            } else {
                alert('Không thể xóa truyện lúc này.');
            }
        } catch (err) {
            console.error('Lỗi khi xóa truyện:', err);
            alert('Lỗi kết nối khi xóa truyện.');
        }
    };

    return (
        <div className="flex h-screen bg-black text-white font-sans overflow-hidden selection:bg-white/20">
            {/* Sidebar */}
            <aside className="w-72 bg-black border-r border-white/5 flex flex-col relative z-20">
                <div className="p-8 border-b border-white/5 flex items-center gap-4">
                    <div className="w-9 h-9 rounded-lg bg-[var(--accent)] flex items-center justify-center font-bold text-white text-lg shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                        C
                    </div>
                    <h1 className="text-xl font-medium tracking-tight text-white">
                        Creator<span className="text-zinc-500 font-normal">Studio</span>
                    </h1>
                </div>

                <nav className="flex-1 px-4 py-8 space-y-2">
                    <p className="px-4 text-[0.65rem] font-bold text-zinc-600 uppercase tracking-widest mb-4">Menu</p>
                    <Link
                        to="/studio"
                        className="flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group bg-white/10 text-white font-medium border border-white/10"
                    >
                        <LayoutDashboard size={20} className="text-white" />
                        <span className="font-medium">My Comics</span>
                    </Link>
                </nav>

                <div className="p-4 border-t border-white/5">
                    <Link
                        to="/"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-500 hover:bg-white/5 hover:text-white transition-all duration-300"
                    >
                        <Home size={20} className="stroke-[1.5]" />
                        <span className="font-medium text-sm tracking-wide">View Site</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-black relative">
                <div className="container mx-auto px-10 pb-12 relative z-10 max-w-7xl animate-fade-in" style={{ paddingTop: '8rem' }}>
                    
                    {!error && (
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-light tracking-tight text-white mb-2">
                                    Comic <span className="font-bold">Library</span>
                                </h1>
                                <p className="text-zinc-400">Quản lý và cập nhật những tác phẩm do chính tay bạn sáng tác hoặc dịch thuật.</p>
                            </div>

                        <div className="shrink-0 flex gap-4">
                            <Link 
                                to="/studio/comics/new" // Ideally this routes to a creator-specific editor or we reuse the admin one
                                className="px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-transform hover:scale-105 active:scale-95 shadow-lg text-sm tracking-widest uppercase"
                                style={{ background: 'var(--accent)', color: 'white' }}
                            >
                                <Plus size={18} /> Đăng Truyện Mới
                            </Link>
                        </div>
                    </div>
                    )}

                {error ? (
                    <div className="p-12 text-center rounded-[2rem] border border-red-500/20 bg-red-500/10">
                        <p className="text-red-500 font-medium text-lg">{error}</p>
                        <Link to="/" className="inline-block mt-6 px-6 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all font-medium">Trở Về Trang Chủ</Link>
                    </div>
                ) : loading ? (
                    <div className="py-20 text-center text-zinc-500">Đang tải xưởng sáng tạo...</div>
                ) : comics.length === 0 ? (
                    <div className="p-16 text-center rounded-[2rem] border border-white/5 bg-zinc-900/30 backdrop-blur-md">
                        <BookOpen size={48} className="mx-auto text-zinc-600 mb-6" strokeWidth={1} />
                        <h3 className="text-xl font-medium text-white mb-2">Chưa có tác phẩm nào</h3>
                        <p className="text-zinc-400 mb-8 max-w-md mx-auto">Bạn chưa đăng bất kỳ bộ truyện nào. Hãy bắt đầu hành trình của mình bằng cách tạo nội dung đầu tiên!</p>
                        <Link 
                            to="/studio/comics/new"
                            className="inline-flex px-8 py-4 rounded-2xl font-bold items-center justify-center gap-3 transition-transform hover:scale-105 active:scale-95 shadow-lg text-sm tracking-widest uppercase"
                            style={{ background: 'white', color: 'black' }}
                        >
                            <Plus size={18} /> Bắt đầu ngay
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {comics.map(comic => (
                            <div key={comic._id || comic.id} className="group relative flex flex-col gap-4">
                                <Link to={`/p/${comic._id || comic.id}`} className="aspect-[2/3] w-full rounded-2xl overflow-hidden relative ring-1 ring-[var(--border)] block">
                                    <LazyImage src={comic.cover_url || comic.cover} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={comic.title} />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                                    
                                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-white">
                                        <div className="flex gap-2 text-xs font-medium">
                                            <span className="flex items-center gap-1"><Eye size={12} /> {comic.views || 0}</span>
                                            <span className="flex items-center gap-1 text-yellow-400"><Star size={12} fill="currentColor" /> {comic.rating || 0}</span>
                                        </div>
                                    </div>
                                    <div className="absolute top-4 right-4 px-2 py-1 bg-black/50 backdrop-blur-md rounded-md border border-white/10 text-[0.65rem] font-bold tracking-wider uppercase text-white">
                                        {comic.chapter_count || 0} Chaps
                                    </div>
                                </Link>
                                
                                <button 
                                    onClick={(e) => { e.preventDefault(); handleDeleteComic(comic._id || comic.id); }}
                                    className="absolute top-4 left-4 p-2 bg-red-600/80 hover:bg-red-500 backdrop-blur-md rounded-xl text-white opacity-0 group-hover:opacity-100 transition-all shadow-lg z-10"
                                    title="Xóa truyện"
                                >
                                    <Trash2 size={16} />
                                </button>
                                
                                <div className="space-y-3">
                                    <h3 className="font-bold text-white text-lg line-clamp-1 group-hover:text-[var(--accent)] transition-colors">{comic.title}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {comic.genres?.slice(0, 2).map((g, i) => (
                                            <span key={i} className="text-[0.65rem] font-bold tracking-widest uppercase px-2 py-1 rounded bg-zinc-800 text-zinc-300">
                                                {g.name}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <Link to={`/studio/comics/${comic._id || comic.id}/chapters`} className="flex-1 py-2.5 rounded-xl bg-[var(--accent)] hover:bg-orange-600 text-white transition-all text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 border border-white/5 shadow-lg">
                                            <BookOpen size={14} /> Chapters
                                        </Link>
                                        {/* Ideally edit routes to a creator specific editor but we'll mock the button */}
                                        <Link to={`/studio/comics/edit/${comic._id || comic.id}`} className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 border border-white/5">
                                            <Edit size={14} /> Chỉnh sửa
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                </div>
            </main>
        </div>
    );
};

export default CreatorStudio;
