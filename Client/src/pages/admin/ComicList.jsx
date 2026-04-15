import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, List, Search } from 'lucide-react';
import { API_BASE_URL } from '../../constants/api';
import { translateStatus } from '../../utils/format';

const ComicList = () => {
    const [comics, setComics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

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
                    <h2 className="text-xl font-bold text-white tracking-tight">Comics Library</h2>
                    <p className="text-zinc-500 mt-1 text-sm font-medium">Manage and organize your comic collection.</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
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

            <div className="bg-[#141414] rounded-xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/[0.02] text-zinc-500 border-b border-white/5 uppercase text-[0.65rem] font-bold tracking-wider">
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
                                        <div className="font-bold text-white text-sm mb-1">{comic.title}</div>
                                        <div className="text-[0.7rem] text-zinc-500 font-medium flex items-center gap-2">
                                            <span>{comic.author}</span>
                                            <span className="w-1 h-1 rounded-full bg-zinc-800"></span>
                                            <span className="text-zinc-600">{comic.chapter_count || 0} Ch.</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-[0.6rem] font-bold border ${comic.status === 'Ongoing' ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/10' :
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
        </div>
    );
};

export default ComicList;
