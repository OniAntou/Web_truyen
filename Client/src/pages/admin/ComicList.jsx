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
        <div className="mt-12 md:mt-16">
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                <div>
                    <h2 className="text-3xl font-medium text-white tracking-tight">Comics Library</h2>
                    <p className="text-zinc-500 mt-2 text-sm tracking-wide">Manage your collection of {comics.length} comics</p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative group w-full md:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors" size={16} strokeWidth={2} />
                        <input
                            type="text"
                            placeholder="Search comics..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-zinc-900/40 border border-white/5 rounded-2xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:bg-zinc-800/50 focus:border-white/20 transition-all placeholder-zinc-600"
                        />
                    </div>

                    <Link
                        to="/admin/comics/new"
                        className="bg-white hover:bg-zinc-200 text-black px-6 py-3 rounded-2xl transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.1)] font-semibold flex items-center gap-2 whitespace-nowrap tracking-wide text-sm"
                    >
                        <Plus size={18} strokeWidth={2.5} />
                        Add Comic
                    </Link>
                </div>
            </div>

            <div className="bg-zinc-900/30 rounded-[2rem] border border-white/5 overflow-hidden backdrop-blur-2xl shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 text-zinc-400 border-b border-white/5 uppercase text-[0.65rem] tracking-widest">
                                <th className="px-6 py-5 font-bold">Cover</th>
                                <th className="px-6 py-5 font-bold">Comic Info</th>
                                <th className="px-6 py-5 font-bold">Status</th>
                                <th className="px-6 py-5 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-zinc-300">
                            {filteredComics.length > 0 ? filteredComics.map((comic) => (
                                <tr key={comic._id || comic.id} className="hover:bg-white/5 transition-colors duration-300 group">
                                    <td className="px-6 py-5 w-24">
                                        <div className="relative h-[4.5rem] w-12 rounded-lg overflow-hidden border border-white/10 group-hover:border-white/20 transition-colors shadow-lg">
                                            <img
                                                src={comic.cover_url}
                                                alt={comic.title}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="font-semibold text-white text-[0.95rem] tracking-tight mb-1.5">{comic.title}</div>
                                        <div className="text-[0.7rem] text-zinc-500 font-medium tracking-wide flex items-center gap-2 uppercase">
                                            <span>{comic.author}</span>
                                            <span className="text-zinc-700">•</span>
                                            <span className="bg-white/5 px-2 py-0.5 rounded-md border border-white/5">{comic.chapter_count || 0} CH</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`px-3 py-1.5 rounded-lg text-[0.65rem] uppercase tracking-widest font-bold border ${comic.status === 'Ongoing' ? 'bg-white/5 text-green-400 border-green-500/20' :
                                                comic.status === 'Completed' ? 'bg-white/5 text-blue-400 border-blue-500/20' :
                                                    'bg-white/5 text-zinc-400 border-white/10'
                                            }`}>
                                            {translateStatus(comic.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <Link
                                                to={`/admin/comics/${comic._id || comic.id}/chapters`}
                                                className="p-2.5 text-zinc-500 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 tooltip"
                                                title="Manage Chapters"
                                            >
                                                <List size={18} strokeWidth={1.5} />
                                            </Link>
                                            <Link
                                                to={`/admin/comics/edit/${comic._id || comic.id}`}
                                                className="p-2.5 text-zinc-500 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300"
                                                title="Edit"
                                            >
                                                <Edit2 size={18} strokeWidth={1.5} />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(comic._id || comic.id)}
                                                className="p-2.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} strokeWidth={1.5} />
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
