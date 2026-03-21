import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';

// ─── Reusable ImagePreviewGrid with drag-and-drop reorder ───
const ImagePreviewGrid = ({ images, setImages, showRemove = true }) => {
    const dragItem = useRef(null);
    const dragOverItem = useRef(null);
    const [draggingIdx, setDraggingIdx] = useState(null);
    const [dragOverIdx, setDragOverIdx] = useState(null);

    const handleDragStart = (idx) => {
        dragItem.current = idx;
        setDraggingIdx(idx);
    };

    const handleDragEnter = (idx) => {
        dragOverItem.current = idx;
        setDragOverIdx(idx);
    };

    const handleDragEnd = () => {
        if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
            const updated = [...images];
            const [removed] = updated.splice(dragItem.current, 1);
            updated.splice(dragOverItem.current, 0, removed);
            setImages(updated);
        }
        dragItem.current = null;
        dragOverItem.current = null;
        setDraggingIdx(null);
        setDragOverIdx(null);
    };

    const handleRemove = (idx) => {
        const updated = [...images];
        URL.revokeObjectURL(updated[idx].preview);
        updated.splice(idx, 1);
        setImages(updated);
    };

    if (images.length === 0) return null;

    return (
        <div className="mt-3">
            <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-400">
                    <span className="text-purple-400 font-semibold">{images.length}</span> ảnh đã chọn — kéo thả để sắp xếp
                </p>
                {showRemove && (
                    <button
                        type="button"
                        onClick={() => {
                            images.forEach(img => URL.revokeObjectURL(img.preview));
                            setImages([]);
                        }}
                        className="text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                        Xóa tất cả
                    </button>
                )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                {images.map((img, idx) => (
                    <div
                        key={img.preview + idx}
                        draggable
                        onDragStart={() => handleDragStart(idx)}
                        onDragEnter={() => handleDragEnter(idx)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => e.preventDefault()}
                        className={`
                            relative group rounded-lg overflow-hidden border-2 cursor-grab active:cursor-grabbing
                            transition-all duration-200 aspect-[2/3]
                            ${draggingIdx === idx ? 'opacity-40 scale-95 border-purple-500' : 'border-gray-700 hover:border-purple-500/60'}
                            ${dragOverIdx === idx && draggingIdx !== idx ? 'border-purple-400 ring-2 ring-purple-500/40 scale-105' : ''}
                        `}
                    >
                        <img
                            src={img.preview}
                            alt={`Page ${idx + 1}`}
                            className="w-full h-full object-cover"
                            draggable={false}
                        />
                        {/* Page number badge */}
                        <div className="absolute top-1 left-1 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                            {idx + 1}
                        </div>
                        {/* Remove button */}
                        {showRemove && (
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleRemove(idx); }}
                                className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                ✕
                            </button>
                        )}
                        {/* Drag indicator */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent py-1 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[10px] text-gray-300">⠿ kéo thả</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ─── Reusable Preview/Upload Modal ───
const PreviewModal = ({ isOpen, onClose, images, setImages, title, footerActions, allowAddMore = false, showRemove = true }) => {
    const modalFileRef = useRef(null);

    const handleFilesSelect = (e) => {
        const selected = Array.from(e.target.files || []);
        if (selected.length === 0) return;
        const newImages = selected.map(file => ({
            file,
            preview: URL.createObjectURL(file),
        }));
        setImages(prev => [...prev, ...newImages]);
        if (modalFileRef.current) modalFileRef.current.value = '';
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl w-full max-w-5xl mx-4 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
                    <h3 className="text-lg font-bold text-white">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-xl transition-colors">&times;</button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {allowAddMore && (
                        <div className="mb-4">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                ref={modalFileRef}
                                onChange={handleFilesSelect}
                                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-gray-300 text-sm focus:border-purple-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                            />
                            <p className="text-xs text-gray-500 mt-1">Chọn thêm ảnh hoặc kéo thả để sắp xếp thứ tự bên dưới.</p>
                        </div>
                    )}

                    <ImagePreviewGrid images={images} setImages={setImages} showRemove={showRemove} />

                    {images.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            <div className="text-4xl mb-2">🖼️</div>
                            <p>Chưa có ảnh nào. Chọn ảnh để bắt đầu.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-700">
                    {footerActions}
                </div>
            </div>
        </div>
    );
};

// ─── Main ChapterManager ───
const ChapterManager = () => {
    const { id } = useParams();
    const [chapters, setChapters] = useState([]);
    const [selectedChapters, setSelectedChapters] = useState(new Set());
    const [comicTitle, setComicTitle] = useState('');
    const [newChapter, setNewChapter] = useState({
        chapter_number: '',
        title: '',
    });
    const [files, setFiles] = useState([]); // array of { file, preview }
    const [uploading, setUploading] = useState(false);

    // For preview popup (new chapter)
    const [previewModalOpen, setPreviewModalOpen] = useState(false);

    // For uploading to existing chapters via modal
    const [modalOpen, setModalOpen] = useState(false);
    const [existingChapterFiles, setExistingChapterFiles] = useState([]);
    const targetChapterIdRef = useRef(null);

    // For reordering existing chapter pages
    const [reorderModalOpen, setReorderModalOpen] = useState(false);
    const [reorderPages, setReorderPages] = useState([]); // { _id, page_number, preview }
    const [reorderLoading, setReorderLoading] = useState(false);
    const [savingOrder, setSavingOrder] = useState(false);
    const reorderChapterIdRef = useRef(null);

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

    useEffect(() => {
        fetchData();
    }, [id]);

    // Cleanup preview URLs on unmount
    useEffect(() => {
        return () => {
            files.forEach(img => URL.revokeObjectURL(img.preview));
        };
    }, []);

    const handleFileChange = (e) => {
        const selected = Array.from(e.target.files || []);
        if (selected.length === 0) return;
        const newImages = selected.map(file => ({
            file,
            preview: URL.createObjectURL(file),
        }));
        setFiles(prev => [...prev, ...newImages]);
        // Reset input so the same files can be selected again
        e.target.value = '';
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

                // 3. Upload Images if selected (in user-arranged order)
                if (files.length > 0) {
                    setUploading(true);
                    await uploadImages(createdChapter._id, files.map(f => f.file));
                    setUploading(false);
                }

                // Cleanup previews
                files.forEach(img => URL.revokeObjectURL(img.preview));
                setNewChapter({ chapter_number: '', title: '' });
                setFiles([]);
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

    // --- Upload for existing chapter via modal ---
    const handleUploadClick = (chapterId) => {
        targetChapterIdRef.current = chapterId;
        setExistingChapterFiles([]);
        setModalOpen(true);
    };

    const handleExistingUploadConfirm = async () => {
        if (existingChapterFiles.length === 0 || !targetChapterIdRef.current) return;

        setUploading(true);
        await uploadImages(targetChapterIdRef.current, existingChapterFiles.map(f => f.file));
        setUploading(false);

        // Cleanup
        existingChapterFiles.forEach(img => URL.revokeObjectURL(img.preview));
        setExistingChapterFiles([]);
        setModalOpen(false);
        targetChapterIdRef.current = null;
        alert('Images uploaded successfully!');
        fetchData();
    };

    const handleExistingModalClose = () => {
        existingChapterFiles.forEach(img => URL.revokeObjectURL(img.preview));
        setExistingChapterFiles([]);
        setModalOpen(false);
        targetChapterIdRef.current = null;
    };

    // --- Reorder existing chapter pages ---
    const handleReorderClick = async (chapterId) => {
        reorderChapterIdRef.current = chapterId;
        setReorderLoading(true);
        setReorderModalOpen(true);
        try {
            const res = await fetch(`http://localhost:5000/api/chapters/${chapterId}/pages`);
            const pages = await res.json();
            setReorderPages(pages.map(p => ({
                _id: p._id,
                page_number: p.page_number,
                preview: p.image_url,
            })));
        } catch (err) {
            console.error('Error fetching pages:', err);
            alert('Không thể tải danh sách ảnh');
            setReorderModalOpen(false);
        } finally {
            setReorderLoading(false);
        }
    };

    const handleSaveReorder = async () => {
        if (!reorderChapterIdRef.current) return;
        setSavingOrder(true);
        try {
            const order = reorderPages.map((p, idx) => ({
                pageId: p._id,
                page_number: idx + 1,
            }));
            const res = await fetch(`http://localhost:5000/api/chapters/${reorderChapterIdRef.current}/reorder-pages`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order }),
            });
            if (res.ok) {
                alert('Đã lưu thứ tự ảnh thành công!');
                setReorderModalOpen(false);
                reorderChapterIdRef.current = null;
                fetchData();
            } else {
                const err = await res.json();
                alert(`Lỗi: ${err.message}`);
            }
        } catch (err) {
            console.error('Save reorder error:', err);
            alert('Có lỗi xảy ra khi lưu thứ tự');
        } finally {
            setSavingOrder(false);
        }
    };

    const handleReorderModalClose = () => {
        setReorderModalOpen(false);
        setReorderPages([]);
        reorderChapterIdRef.current = null;
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
            {/* Preview Modal for new chapter images */}
            <PreviewModal
                isOpen={previewModalOpen}
                onClose={() => setPreviewModalOpen(false)}
                images={files}
                setImages={setFiles}
                title={`Preview ảnh — ${files.length} trang`}
                footerActions={
                    <>
                        <button
                            onClick={() => setPreviewModalOpen(false)}
                            className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors text-sm"
                        >
                            Đóng
                        </button>
                    </>
                }
            />

            {/* Upload Modal for existing chapters */}
            <PreviewModal
                isOpen={modalOpen}
                onClose={handleExistingModalClose}
                images={existingChapterFiles}
                setImages={setExistingChapterFiles}
                title="Upload ảnh vào Chapter"
                allowAddMore={true}
                footerActions={
                    <>
                        <button
                            onClick={handleExistingModalClose}
                            className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors text-sm"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleExistingUploadConfirm}
                            disabled={existingChapterFiles.length === 0 || uploading}
                            className={`px-6 py-2 rounded-lg font-semibold text-sm transition-colors ${
                                existingChapterFiles.length === 0 || uploading
                                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                            }`}
                        >
                            {uploading ? 'Đang upload...' : `Upload ${existingChapterFiles.length} ảnh`}
                        </button>
                    </>
                }
            />

            {/* Reorder Modal for existing chapter pages */}
            <PreviewModal
                isOpen={reorderModalOpen}
                onClose={handleReorderModalClose}
                images={reorderPages}
                setImages={setReorderPages}
                title="Sắp xếp thứ tự ảnh trong Chapter"
                showRemove={false}
                footerActions={
                    <>
                        <button
                            onClick={handleReorderModalClose}
                            className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors text-sm"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleSaveReorder}
                            disabled={reorderPages.length === 0 || savingOrder}
                            className={`px-6 py-2 rounded-lg font-semibold text-sm transition-colors ${
                                reorderPages.length === 0 || savingOrder
                                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                    : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                        >
                            {savingOrder ? 'Đang lưu...' : `Lưu thứ tự (${reorderPages.length} trang)`}
                        </button>
                    </>
                }
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
                                onChange={(e) => setNewChapter({ ...newChapter, chapter_number: e.target.value })}
                                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-purple-500 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-1 text-sm">Title (Optional)</label>
                            <input
                                type="text"
                                value={newChapter.title}
                                onChange={(e) => setNewChapter({ ...newChapter, title: e.target.value })}
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
                                onChange={handleFileChange}
                                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-gray-300 text-sm focus:border-purple-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                            />
                            <p className="text-xs text-gray-500 mt-1">Chọn nhiều ảnh.</p>
                        </div>

                        {/* Preview button — opens popup */}
                        {files.length > 0 && (
                            <button
                                type="button"
                                onClick={() => setPreviewModalOpen(true)}
                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-purple-600/50 bg-purple-600/10 hover:bg-purple-600/20 text-purple-300 hover:text-purple-200 transition-colors text-sm font-medium"
                            >
                                🖼️ Xem & sắp xếp {files.length} ảnh
                            </button>
                        )}

                        <button
                            type="submit"
                            disabled={uploading}
                            className={`w-full font-bold py-2 rounded transition-colors ${uploading
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
                                            onClick={() => handleReorderClick(chapter._id)}
                                            className="text-purple-400 hover:text-purple-300 border border-purple-900 hover:bg-purple-900/40 rounded px-2 py-1 text-xs transition-colors"
                                        >
                                            Reorder
                                        </button>
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

            {/* Custom scrollbar styles */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 3px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #6b7280; }
            `}</style>
        </div>
    );
};

export default ChapterManager;
