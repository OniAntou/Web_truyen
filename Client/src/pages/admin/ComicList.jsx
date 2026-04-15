import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, List, Search, LayoutGrid, LayoutList, Eye, Star } from 'lucide-react';
import { API_BASE_URL } from '../../constants/api';
import { translateStatus } from '../../utils/format';
import LazyImage from '../../components/ui/LazyImage';

const ComicList = () => {
    const [comics, setComics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState(() => {
        return localStorage.getItem('adminComicViewMode') || 'list';
    });

    const toggleViewMode = (mode) => {
        setViewMode(mode);
        localStorage.setItem('adminComicViewMode', mode);
    };

    const fetchComics = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/comics`);
            const data = await response.json();
            setComics(data.comics || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching comics:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComics();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this comic?')) return;

        const token = localStorage.getItem('token');
        if (!token) {
            alert('Bạn cần đăng nhập để xóa truyện.');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/comics/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                setComics(comics.filter(comic => comic._id !== id && comic.id !== id));
            } else if (response.status === 401 || response.status === 403) {
                alert('Không có quyền xóa truyện. Vui lòng đăng nhập lại.');
                localStorage.removeItem('token');
                localStorage.removeItem('admin');
                window.location.href = '/admin/login';
            } else {
                const errorData = await response.json();
                alert(errorData.message || 'Failed to delete comic');
            }
        } catch (error) {
            console.error('Error deleting comic:', error);
            alert('Lỗi kết nối khi xóa truyện. Vui lòng thử lại.');
        }
    };

    const filteredComics = Array.isArray(comics) ? comics.filter(comic =>
        comic.title.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    if (loading) return (
        <div className="flex items-center justify-center h-64 text-zinc-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mr-4"></div>
            Loading library...
        </div>
    );

    return (
        <div className="mt-8 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-end pb-6 border-b border-white/5 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Comics Library</h2>
                    <p className="text-zinc-500 mt-1 text-base font-medium">Manage and organize your comic collection.</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex bg-[#141414] border border-white/5 rounded-lg p-1 mr-2">
                        <button
                            onClick={() => toggleViewMode('list')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                            title="List View"
                        >
                            <LayoutList size={20} />
                        </button>
                        <button
                            onClick={() => toggleViewMode('grid')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                            title="Grid View (Studio Style)"
                        >
                            <LayoutGrid size={20} />
                        </button>
                    </div>

                    <div className="relative group w-full md:w-64">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Search library..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#141414] border border-white/5 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-white/20 transition-all placeholder-zinc-700 font-medium"
                        />
                    </div>
 
                    <Link
                        to="/admin/comics/new"
                        className="bg-white hover:bg-zinc-200 text-black px-5 py-2.5 rounded-lg transition-all font-bold flex items-center gap-2 tracking-tight text-sm active:scale-95"
                    >
                        <Plus size={18} strokeWidth={3} />
                        Add Comic
                    </Link>
                </div>
            </div>

            {viewMode === 'list' ? (
                <div className="bg-[#141414] rounded-xl border border-white/5 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/[0.02] text-zinc-500 border-b border-white/5 uppercase text-xs font-bold tracking-wider">
                                    <th className="px-6 py-4">Cover</th>
                                    <th className="px-6 py-4">Comic Info</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.02] text-zinc-400">
                                {filteredComics.length > 0 ? filteredComics.map((comic) => (
                                    <tr key={comic._id || comic.id} className="hover:bg-white/[0.01] transition-colors duration-150 group">
                                        <td className="px-6 py-4 w-24">
                                            <div className="relative h-16 w-11 rounded border border-white/10 group-hover:border-white/20 transition-colors">
                                                <img
                                                    src={comic.cover_url}
                                                    alt={comic.title}
                                                    className="h-full w-full object-cover grayscale-[0.4] group-hover:grayscale-0 transition-all duration-300"
                                                />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-white text-base mb-1">{comic.title}</div>
                                            <div className="text-xs text-zinc-500 font-medium flex items-center gap-2">
                                                <span>{comic.author}</span>
                                                <span className="w-1 h-1 rounded-full bg-zinc-800"></span>
                                                <span className="text-zinc-600">{comic.chapter_count || 0} Ch.</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-[0.7rem] font-bold border ${comic.status === 'Ongoing' ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/10' :
                                                    comic.status === 'Completed' ? 'bg-blue-500/5 text-blue-500 border-blue-500/10' :
                                                        'bg-white/5 text-zinc-600 border-white/10'
                                                }`}>
                                                {translateStatus(comic.status || 'Ongoing')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link
                                                    to={`/admin/comics/${comic._id || comic.id}/chapters`}
                                                    className="p-2 text-zinc-500 hover:text-white transition-colors"
                                                    title="Manage Chapters"
                                                >
                                                    <List size={18} />
                                                </Link>
                                                <Link
                                                    to={`/admin/comics/edit/${comic._id || comic.id}`}
                                                    className="p-2 text-zinc-500 hover:text-white transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={18} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(comic._id || comic.id)}
                                                    className="p-2 text-zinc-500 hover:text-red-500 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-16 text-center text-zinc-500 text-sm tracking-wide">
                                            No comics found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredComics.length > 0 ? filteredComics.map((comic) => (
                        <div key={comic._id || comic.id} className="group relative flex flex-col gap-4 bg-[#141414] p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                            <Link to={`/admin/comics/${comic._id || comic.id}/chapters`} className="aspect-[2/3] w-full rounded-xl overflow-hidden relative border border-white/5 block">
                                <LazyImage src={comic.cover_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={comic.title} />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                                
                                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center text-white">
                                    <div className="flex gap-2 text-xs font-medium">
                                        <span className="flex items-center gap-1"><Eye size={12} /> {comic.views || 0}</span>
                                        <span className="flex items-center gap-1 text-yellow-400"><Star size={12} fill="currentColor" /> {comic.rating || 0}</span>
                                    </div>
                                </div>
                                <div className="absolute top-3 right-3 px-2 py-1 bg-black/50 backdrop-blur-md rounded-md border border-white/10 text-[0.65rem] font-bold tracking-wider uppercase text-white">
                                    {comic.chapter_count || 0} Ch.
                                </div>
                            </Link>
                            
                            <button 
                                onClick={(e) => { e.preventDefault(); handleDelete(comic._id || comic.id); }}
                                className="absolute top-6 left-6 p-2 bg-red-600/80 hover:bg-red-500 backdrop-blur-md rounded-xl text-white opacity-0 group-hover:opacity-100 transition-all shadow-lg z-10"
                                title="Delete Comic"
                            >
                                <Trash2 size={16} />
                            </button>
                            
                            <div className="space-y-3">
                                <h3 className="font-bold text-white text-lg line-clamp-1 group-hover:text-white transition-colors">{comic.title}</h3>
                                <div className="flex items-center justify-between">
                                    <span className={`px-2 py-0.5 rounded text-[0.6rem] font-bold border ${comic.status === 'Ongoing' ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/10' :
                                            comic.status === 'Completed' ? 'bg-blue-500/5 text-blue-500 border-blue-500/10' :
                                                'bg-white/5 text-zinc-600 border-white/10'
                                        }`}>
                                        {translateStatus(comic.status || 'Ongoing')}
                                    </span>
                                    <span className="text-xs text-zinc-500 font-medium truncate max-w-[100px]">{comic.author}</span>
                                </div>
                                
                                <div className="flex gap-2 pt-1">
                                    <Link to={`/admin/comics/${comic._id || comic.id}/chapters`} className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-all text-[0.65rem] font-bold tracking-widest uppercase flex items-center justify-center gap-2 border border-white/5">
                                        <List size={14} /> Chapters
                                    </Link>
                                    <Link to={`/admin/comics/edit/${comic._id || comic.id}`} className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-all text-[0.65rem] font-bold tracking-widest uppercase flex items-center justify-center gap-2 border border-white/5">
                                        <Edit2 size={14} /> Edit
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-16 text-center text-zinc-500 text-sm tracking-wide">
                            No comics found matching your search.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ComicList;
