import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const ChapterManager = () => {
    const { id } = useParams();
    const [chapters, setChapters] = useState([]);
    const [comicTitle, setComicTitle] = useState('');
    const [newChapter, setNewChapter] = useState({
        chapter_number: '',
        title: '',
    });

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/comics/${id}`);
            const data = await response.json();
            setChapters(data.chapters || []);
            setComicTitle(data.title);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleAddChapter = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                comic_id: id, // In real app, might need to match ObjectId depending on backend
                chapter_number: Number(newChapter.chapter_number),
                title: newChapter.title || `Chapter ${newChapter.chapter_number}`,
                date: "Today"
            };

            // NOTE: Ideally the backend should handle finding the correct ObjectId for comid_id if we passed a legacy ID.
            // But since our backend seed used the _id for relationships, we need to make sure we are passing the correct ID.
            // The `id` from useParams might be the numeric id or the _id depending on how we navigated?
            // Actually, in `ComicList` we linked using `_id || id`. Let's assume the backend endpoint handles 
            // the lookup correctly or we need to pass the `_id` specifically.
            // Let's check `server.js`. The GET `/api/comics/:id` returns the comic object.
            // The comic object has `_id`. The backend `POST /api/chapters` expects `comic_id`.
            // Let's verify if we need to fetch the comic first to get the `_id` to be safe, 
            // OR if our current route `id` is already the `_id`.
            // In ComicList, we use `to={/admin/comics/${comic._id || comic.id}/chapters}`.
            // Mongoose `_id` is 24 chars hex. Legacy `id` is number.
            
            // To be safe, let's look at the fetch response.
            // The fetch response includes the comic object spread. So `data._id` should be available.
            // Let's refactor fetchData to store the comic _id.
            
            // For now, let's assume the backend simply saves what we send. 
            // But `server.js` `ChapterSchema` defines `comic_id` as `ObjectId`. 
            // So we MUST send a valid ObjectId strings if we want relations to work.
            // If the URL param `id` is a number (legacy), we can't save it as an ObjectId ref.
            // Wait, looking at `server.js`:
            // `const ChapterSchema = new mongoose.Schema({ comic_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Comic' }, ...`
            // So `comic_id` MUST be an ObjectId.
            
            // Solution: We need the actual `_id` of the comic.
            // We can get it from the `fetchData` result.
            
             /* 
                We will fetch the comic details first (which we do in useEffect).
                But we need to access that state in this function.
                I'll add `comicId` state.
             */
             
            // Re-fetch to get the _id if needed, or better, store it in state.
            const comicRes = await fetch(`http://localhost:5000/api/comics/${id}`);
            const comicData = await comicRes.json();
            
            const finalPayload = {
                ...payload,
                comic_id: comicData._id // Ensure we use the MongoDB _id
            };

            const response = await fetch('http://localhost:5000/api/chapters', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalPayload)
            });

            if (response.ok) {
                setNewChapter({ chapter_number: '', title: '' });
                fetchData(); // Refresh list
            } else {
                alert('Failed to add chapter');
            }
        } catch (error) {
            console.error('Error adding chapter:', error);
        }
    };

    const handleDelete = async (chapterId) => {
        if (!confirm('Delete this chapter?')) return;
        try {
            const response = await fetch(`http://localhost:5000/api/chapters/${chapterId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setChapters(chapters.filter(c => c._id !== chapterId));
            }
        } catch (error) {
            console.error('Error deleting chapter:', error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                 <Link to="/admin/comics" className="text-gray-400 hover:text-white">
                    &larr; Back
                </Link>
                <h2 className="text-3xl font-bold text-white">Manage Chapters: <span className="text-purple-400">{comicTitle}</span></h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Add Chapter Form */}
                <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 h-fit">
                    <h3 className="text-xl font-bold text-white mb-4">Add New Chapter</h3>
                    <form onSubmit={handleAddChapter} className="space-y-4">
                        <div>
                            <label className="block text-gray-400 mb-1 text-sm">Chapter Number</label>
                            <input
                                type="number"
                                value={newChapter.chapter_number}
                                onChange={(e) => setNewChapter({...newChapter, chapter_number: e.target.value})}
                                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-purple-500 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-1 text-sm">Title (Optional)</label>
                            <input
                                type="text"
                                value={newChapter.title}
                                onChange={(e) => setNewChapter({...newChapter, title: e.target.value})}
                                placeholder="e.g. The Beginning"
                                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-purple-500 outline-none"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded transition-colors"
                        >
                            Add Chapter
                        </button>
                    </form>
                </div>

                {/* Chapter List */}
                <div className="md:col-span-2 bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-750 text-gray-400 border-b border-gray-700 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-3">#</th>
                                <th className="px-6 py-3">Title</th>
                                <th className="px-6 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700 text-gray-300">
                            {chapters.map((chapter) => (
                                <tr key={chapter._id} className="hover:bg-gray-750">
                                    <td className="px-6 py-3 font-medium">{chapter.chapter_number}</td>
                                    <td className="px-6 py-3">{chapter.title}</td>
                                    <td className="px-6 py-3 text-right">
                                        <button
                                            onClick={() => handleDelete(chapter._id)}
                                            className="text-red-400 hover:text-red-300 border border-red-900 hover:bg-red-900/40 rounded px-2 py-1 text-xs transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {chapters.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="px-6 py-8 text-center text-gray-500 italic">
                                        No chapters found.
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

export default ChapterManager;
