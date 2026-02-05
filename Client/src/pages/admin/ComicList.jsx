import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, List, Search } from 'lucide-react';

const ComicList = () => {
    const [comics, setComics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchComics();
    }, []);

    const fetchComics = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/comics');
            const data = await response.json();
            setComics(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching comics:', error);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this comic?')) return;

        try {
            const response = await fetch(`http://localhost:5000/api/comics/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setComics(comics.filter(comic => comic._id !== id && comic.id !== id));
            } else {
                alert('Failed to delete comic');
            }
        } catch (error) {
            console.error('Error deleting comic:', error);
        }
    };

    const filteredComics = comics.filter(comic => 
        comic.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex items-center justify-center h-64 text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mr-3"></div>
            Loading library...
        </div>
    );

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white">Comics Library</h2>
                    <p className="text-gray-400 mt-1">Manage your collection of {comics.length} comics</p>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative group w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-500 transition-colors" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search comics..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#1e1e1e] border border-gray-800 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder-gray-600"
                        />
                    </div>
                    
                    <Link
                        to="/admin/comics/new"
                        className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-purple-600/20 font-semibold flex items-center gap-2 whitespace-nowrap"
                    >
                        <Plus size={18} />
                        Add Comic
                    </Link>
                </div>
            </div>

            <div className="bg-[#1e1e1e] rounded-2xl shadow-xl border border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#111] text-gray-400 border-b border-gray-800 uppercase text-xs tracking-wider">
                                <th className="px-6 py-5 font-semibold">Cover</th>
                                <th className="px-6 py-5 font-semibold">Comic Info</th>
                                <th className="px-6 py-5 font-semibold">Status</th>
                                <th className="px-6 py-5 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800 text-gray-300">
                            {filteredComics.length > 0 ? filteredComics.map((comic) => (
                                <tr key={comic._id || comic.id} className="hover:bg-gray-800/50 transition-colors duration-150 group">
                                    <td className="px-6 py-4 w-20">
                                        <div className="relative h-16 w-12 rounded overflow-hidden shadow-md border border-gray-700 group-hover:border-gray-600 transition-colors">
                                            <img
                                                src={comic.cover_url}
                                                alt={comic.title}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-white text-base mb-1">{comic.title}</div>
                                        <div className="text-xs text-gray-500 flex gap-2">
                                            <span>{comic.author}</span>
                                            <span className="text-gray-700">•</span>
                                            <span className="bg-gray-800 px-1.5 rounded text-gray-400 border border-gray-700">{comic.chapter_count || 0} Ch</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
                                            comic.status === 'Ongoing' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                            comic.status === 'Completed' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                            'bg-gray-700 text-gray-300 border-gray-600'
                                        }`}>
                                            {comic.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                to={`/admin/comics/${comic._id || comic.id}/chapters`}
                                                className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors tooltip"
                                                title="Manage Chapters"
                                            >
                                                <List size={18} />
                                            </Link>
                                            <Link
                                                to={`/admin/comics/edit/${comic._id || comic.id}`}
                                                className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 size={18} />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(comic._id || comic.id)}
                                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
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
