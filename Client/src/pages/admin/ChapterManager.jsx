import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';

const ChapterManager = () => {
    const { id } = useParams();
    const [chapters, setChapters] = useState([]);
    const [selectedChapters, setSelectedChapters] = useState(new Set());
    const [comicTitle, setComicTitle] = useState('');
    const [newChapter, setNewChapter] = useState({
        chapter_number: '',
        title: '',
    });
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    
    // For uploading to existing chapters
    const fileInputRef = useRef(null);
    const targetChapterIdRef = useRef(null);

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
            // 1. Get Comic ID (ensure MongoDB _id)
            const comicRes = await fetch(`http://localhost:5000/api/comics/${id}`);
            const comicData = await comicRes.json();
            
            const payload = {
                comic_id: comicData._id,
                chapter_number: Number(newChapter.chapter_number),
                title: newChapter.title || `Chapter ${newChapter.chapter_number}`,
                date: new Date().toISOString().split('T')[0]
            };

            // 2. Create Chapter
            const response = await fetch('http://localhost:5000/api/chapters', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const createdChapter = await response.json();
                
                // 3. Upload Images if selected
                if (files.length > 0) {
                    setUploading(true);
                    await uploadImages(createdChapter._id, files);
                    setUploading(false);
                }

                setNewChapter({ chapter_number: '', title: '' });
                setFiles([]);
                // Reset file input value manually
                if (document.getElementById('new-chapter-files')) {
                    document.getElementById('new-chapter-files').value = ''; 
                }
                
                fetchData(); // Refresh list
            } else {
                alert('Failed to add chapter');
            }
        } catch (error) {
            console.error('Error adding chapter:', error);
            setUploading(false);
        }
    };

    const uploadImages = async (chapterId, fileList) => {
        try {
            const formData = new FormData();
            for (let i = 0; i < fileList.length; i++) {
                formData.append('pages', fileList[i]);
            }

            const res = await fetch(`http://localhost:5000/api/upload/chapter/${chapterId}`, {
                method: 'POST',
                body: formData
            });
            
            if (!res.ok) {
                const err = await res.json();
                alert(`Upload failed: ${err.message}`);
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Upload error occurred');
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
                setSelectedChapters(prev => {
                    const next = new Set(prev);
                    next.delete(chapterId);
                    return next;
                });
            }
        } catch (error) {
            console.error('Error deleting chapter:', error);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedChapters.size === 0) return;
        if (!confirm(`Delete ${selectedChapters.size} chapters?`)) return;

        try {
            const response = await fetch('http://localhost:5000/api/chapters/bulk-delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chapterIds: Array.from(selectedChapters) })
            });

            if (response.ok) {
                setChapters(chapters.filter(c => !selectedChapters.has(c._id)));
                setSelectedChapters(new Set());
            } else {
                alert('Failed to delete chapters');
            }
        } catch (error) {
            console.error('Error deleting chapters:', error);
        }
    };

    // --- Upload for existing chapter ---
    const handleUploadClick = (chapterId) => {
        targetChapterIdRef.current = chapterId;
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleExistingFileChange = async (e) => {
        const selected = e.target.files;
        if (selected && selected.length > 0 && targetChapterIdRef.current) {
            if (!confirm(`Upload ${selected.length} images to this chapter?`)) {
                fileInputRef.current.value = '';
                return;
            }
            
            setUploading(true);
            await uploadImages(targetChapterIdRef.current, selected);
            setUploading(false);
            
            fileInputRef.current.value = '';
            targetChapterIdRef.current = null;
            alert('Images uploaded successfully!');
        }
    };
    // -----------------------------------

    const toggleSelectAll = () => {
        if (selectedChapters.size === chapters.length) {
            setSelectedChapters(new Set());
        } else {
            setSelectedChapters(new Set(chapters.map(c => c._id)));
        }
    };

    const toggleSelect = (chapterId) => {
        setSelectedChapters(prev => {
            const next = new Set(prev);
            if (next.has(chapterId)) {
                next.delete(chapterId);
            } else {
                next.add(chapterId);
            }
            return next;
        });
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Hidden Input for Quick Upload */}
            <input 
                type="file" 
                multiple 
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleExistingFileChange}
            />

            <div className="flex items-center gap-4 mb-6">
                 <Link to="/admin/comics" className="text-gray-400 hover:text-white">
                    &larr; Back
                </Link>
                <div className="flex-1">
                    <h2 className="text-3xl font-bold text-white">Manage Chapters: <span className="text-purple-400">{comicTitle}</span></h2>
                </div>
                {selectedChapters.size > 0 && (
                    <button
                        onClick={handleBulkDelete}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
                    >
                        Delete Selected ({selectedChapters.size})
                    </button>
                )}
            </div>

            {uploading && (
                <div className="mb-4 bg-blue-600/20 border border-blue-500 text-blue-200 px-4 py-3 rounded animate-pulse">
                    Please wait... Uploading images to Cloudflare R2...
                </div>
            )}

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
                        <div>
                            <label className="block text-gray-400 mb-1 text-sm">Pages (Images)</label>
                            <input
                                id="new-chapter-files"
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={(e) => setFiles(e.target.files)}
                                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-gray-300 text-sm focus:border-purple-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                            />
                            <p className="text-xs text-gray-500 mt-1">Select multiple images.</p>
                        </div>
                        <button
                            type="submit"
                            disabled={uploading}
                            className={`w-full font-bold py-2 rounded transition-colors ${
                                uploading 
                                ? 'bg-gray-600 cursor-not-allowed text-gray-300' 
                                : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                        >
                            {uploading ? 'Processing...' : 'Add Chapter'}
                        </button>
                    </form>
                </div>

                {/* Chapter List */}
                <div className="md:col-span-2 bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-750 text-gray-400 border-b border-gray-700 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-3">
                                    <input
                                        type="checkbox"
                                        checked={chapters.length > 0 && selectedChapters.size === chapters.length}
                                        onChange={toggleSelectAll}
                                        className="rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500"
                                    />
                                </th>
                                <th className="px-6 py-3">#</th>
                                <th className="px-6 py-3">Title</th>
                                <th className="px-6 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700 text-gray-300">
                            {chapters.map((chapter) => (
                                <tr key={chapter._id} className="hover:bg-gray-750">
                                    <td className="px-6 py-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedChapters.has(chapter._id)}
                                            onChange={() => toggleSelect(chapter._id)}
                                            className="rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500"
                                        />
                                    </td>
                                    <td className="px-6 py-3 font-medium">{chapter.chapter_number}</td>
                                    <td className="px-6 py-3">{chapter.title}</td>
                                    <td className="px-6 py-3 text-right flex justify-end gap-2">
                                        <button
                                            onClick={() => handleUploadClick(chapter._id)}
                                            className="text-blue-400 hover:text-blue-300 border border-blue-900 hover:bg-blue-900/40 rounded px-2 py-1 text-xs transition-colors"
                                        >
                                            Upload
                                        </button>
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
                                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500 italic">
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
