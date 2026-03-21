import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';

// ─── Reusable ImagePreviewGrid with drag-and-drop reorder ───
const ImagePreviewGrid = ({ images, setImages, showRemove = true, onRemove }) => {
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
        if (onRemove) {
            onRemove(idx);
            return;
        }
        const updated = [...images];
        URL.revokeObjectURL(updated[idx].preview);
        updated.splice(idx, 1);
        setImages(updated);
    };

    if (images.length === 0) return null;

    return (
        <div className="mt-4">
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-zinc-400 tracking-wide font-medium">
                    <span className="text-white font-bold">{images.length}</span> ảnh đã chọn — kéo thả để sắp xếp
                </p>
                {showRemove && !onRemove && (
                    <button
                        type="button"
                        onClick={() => {
                            images.forEach(img => URL.revokeObjectURL(img.preview));
                            setImages([]);
                        }}
                        className="text-xs font-bold tracking-widest uppercase text-red-500 hover:text-red-400 transition-colors bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg"
                    >
                        Xóa tất cả
                    </button>
                )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {images.map((img, idx) => (
                    <div
                        key={img.preview + idx}
                        draggable
                        onDragStart={() => handleDragStart(idx)}
                        onDragEnter={() => handleDragEnter(idx)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => e.preventDefault()}
                        className={`
                            relative group rounded-xl overflow-hidden border cursor-grab active:cursor-grabbing
                            transition-all duration-300 aspect-[2/3] shadow-lg
                            ${draggingIdx === idx ? 'opacity-40 scale-95 border-white' : 'border-white/10 hover:border-white/30'}
                            ${dragOverIdx === idx && draggingIdx !== idx ? 'border-white ring-2 ring-white/20 scale-105' : ''}
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
const PreviewModal = ({ isOpen, onClose, images, setImages, title, footerActions, allowAddMore = false, showRemove = true, onRemove }) => {
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-3xl">
            <div className="bg-zinc-950/80 rounded-[2rem] border border-white/10 shadow-2xl w-full max-w-5xl mx-4 max-h-[90vh] flex flex-col backdrop-blur-3xl">
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
                    <h3 className="text-xl font-medium tracking-tight text-white">{title}</h3>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white text-2xl transition-colors leading-none">&times;</button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-8 py-6">
                    {allowAddMore && (
                        <div className="mb-6">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                ref={modalFileRef}
                                onChange={handleFilesSelect}
                                className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-zinc-300 text-sm focus:border-white/20 outline-none file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-white file:text-black hover:file:bg-zinc-200 transition-all cursor-pointer"
                            />
                            <p className="text-xs font-medium tracking-wide text-zinc-500 mt-2 ml-1">Chọn thêm ảnh hoặc kéo thả để sắp xếp thứ tự bên dưới.</p>
                        </div>
                    )}

                    <ImagePreviewGrid images={images} setImages={setImages} showRemove={showRemove} onRemove={onRemove} />

                    {images.length === 0 && (
                        <div className="text-center py-20 text-zinc-600">
                            <div className="text-5xl mb-4 opacity-50">🖼️</div>
                            <p className="text-sm tracking-wide">Chưa có ảnh nào. Chọn ảnh để bắt đầu.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-8 py-6 border-t border-white/5">
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

    const handleDeleteExistingPage = async (idx) => {
        const pageToDelete = reorderPages[idx];
        if (!pageToDelete || !pageToDelete._id) return;
        
        if (!window.confirm(`Bạn có chắc muốn xóa vĩnh viễn trang ${idx + 1} này không?\nHành động này sẽ xóa file gốc trên Cloudflare R2 và không thể hoàn tác.`)) return;

        try {
            const res = await fetch(`http://localhost:5000/api/chapters/${reorderChapterIdRef.current}/pages/${pageToDelete._id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                const updated = [...reorderPages];
                updated.splice(idx, 1);
                // Adjust local page numbers
                for (let i = idx; i < updated.length; i++) {
                    updated[i].page_number -= 1;
                }
                setReorderPages(updated);
                fetchData(); // Refresh chapters count if needed
            } else {
                const err = await res.json();
                alert(`Lỗi: ${err.message}`);
            }
        } catch (err) {
            console.error('Delete page error:', err);
            alert('Có lỗi xảy ra khi xóa ảnh');
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
        <div className="max-w-5xl mx-auto mt-12 md:mt-16">
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
                            className="px-6 py-2.5 rounded-xl border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 transition-all text-sm font-semibold tracking-wide uppercase"
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
                            className="px-6 py-2.5 rounded-xl border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 transition-all text-sm font-semibold tracking-wide uppercase"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleExistingUploadConfirm}
                            disabled={existingChapterFiles.length === 0 || uploading}
                            className={`px-8 py-2.5 rounded-xl font-bold text-sm transition-all tracking-wide uppercase shadow-lg ${
                                existingChapterFiles.length === 0 || uploading
                                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                    : 'bg-white hover:bg-zinc-200 text-black shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                            }`}
                        >
                            {uploading ? 'Đang upload...' : `Upload ${existingChapterFiles.length} ảnh`}
                        </button>
                    </>
                }
            />

            {/* Reorder/Manage Modal for existing chapter pages */}
            <PreviewModal
                isOpen={reorderModalOpen}
                onClose={handleReorderModalClose}
                images={reorderPages}
                setImages={setReorderPages}
                title="Quản lý ảnh trong Chapter (Sắp xếp / Xóa)"
                showRemove={true}
                onRemove={handleDeleteExistingPage}
                footerActions={
                    <>
                        <button
                            onClick={handleReorderModalClose}
                            className="px-6 py-2.5 rounded-xl border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 transition-all text-sm font-semibold tracking-wide uppercase"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleSaveReorder}
                            disabled={reorderPages.length === 0 || savingOrder}
                            className={`px-8 py-2.5 rounded-xl font-bold text-sm transition-all tracking-wide uppercase shadow-lg ${
                                reorderPages.length === 0 || savingOrder
                                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                    : 'bg-white hover:bg-zinc-200 text-black shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                            }`}
                        >
                            {savingOrder ? 'Đang lưu...' : `Lưu thứ tự (${reorderPages.length} trang)`}
                        </button>
                    </>
                }
            />

            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <Link to="/admin/comics" className="text-zinc-500 hover:text-white transition-colors flex items-center justify-center p-2 rounded-xl border border-zinc-800 hover:border-white/20 bg-zinc-900/30">
                        &larr;
                    </Link>
                    <div>
                        <h2 className="text-3xl font-medium text-white tracking-tight">Manage Chapters</h2>
                        <span className="text-zinc-500 text-sm tracking-wide">{comicTitle}</span>
                    </div>
                </div>
                {selectedChapters.size > 0 && (
                    <button
                        onClick={handleBulkDelete}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-500 font-semibold py-2.5 px-6 rounded-xl border border-red-500/20 transition-all text-sm tracking-wide uppercase"
                    >
                        Delete Selected ({selectedChapters.size})
                    </button>
                )}
            </div>

            {uploading && (
                <div className="mb-8 bg-white/5 border border-white/10 text-white px-6 py-4 rounded-2xl animate-pulse text-sm font-medium tracking-wide flex items-center justify-center">
                    Please wait... Uploading images to Cloudflare R2...
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Add Chapter Form */}
                <div className="bg-zinc-900/30 p-8 rounded-[2rem] shadow-2xl border border-white/5 h-fit backdrop-blur-2xl">
                    <h3 className="text-xl font-medium tracking-tight text-white mb-6">Add New Chapter</h3>
                    <form onSubmit={handleAddChapter} className="space-y-6">
                        <div>
                            <label className="block text-[0.7rem] font-bold text-zinc-400 uppercase tracking-widest mb-2 ml-1">Chapter Number</label>
                            <input
                                type="number"
                                value={newChapter.chapter_number}
                                onChange={(e) => setNewChapter({ ...newChapter, chapter_number: e.target.value })}
                                className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-white text-sm focus:border-white/20 outline-none placeholder-zinc-600 transition-all"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[0.7rem] font-bold text-zinc-400 uppercase tracking-widest mb-2 ml-1">Title (Optional)</label>
                            <input
                                type="text"
                                value={newChapter.title}
                                onChange={(e) => setNewChapter({ ...newChapter, title: e.target.value })}
                                placeholder="e.g. The Beginning"
                                className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-white text-sm focus:border-white/20 outline-none placeholder-zinc-600 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-[0.7rem] font-bold text-zinc-400 uppercase tracking-widest mb-2 ml-1">Pages (Images)</label>
                            <input
                                id="new-chapter-files"
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleFileChange}
                                className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-zinc-300 text-sm focus:border-white/20 outline-none file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-white file:text-black hover:file:bg-zinc-200 transition-all cursor-pointer"
                            />
                            <p className="text-xs font-medium tracking-wide text-zinc-500 mt-2 ml-1">Chọn tải lên nhiều ảnh cùng lúc.</p>
                        </div>

                        {/* Preview button — opens popup */}
                        {files.length > 0 && (
                            <button
                                type="button"
                                onClick={() => setPreviewModalOpen(true)}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-colors text-sm font-semibold tracking-wide"
                            >
                                🖼️ Xem & sắp xếp {files.length} ảnh
                            </button>
                        )}

                        <button
                            type="submit"
                            disabled={uploading}
                            className={`w-full flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-sm py-4 rounded-2xl transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] mt-4 ${uploading
                                    ? 'bg-zinc-800 cursor-not-allowed text-zinc-500 shadow-none'
                                    : 'bg-white hover:bg-zinc-200 text-black'
                                }`}
                        >
                            {uploading ? 'Processing...' : 'Add Chapter'}
                        </button>
                    </form>
                </div>

                {/* Chapter List */}
                <div className="md:col-span-2 bg-zinc-900/30 rounded-[2rem] shadow-2xl border border-white/5 overflow-hidden backdrop-blur-2xl">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-zinc-400 border-b border-white/5 uppercase text-[0.65rem] tracking-widest">
                            <tr>
                                <th className="px-6 py-5">
                                    <input
                                        type="checkbox"
                                        checked={chapters.length > 0 && selectedChapters.size === chapters.length}
                                        onChange={toggleSelectAll}
                                        className="rounded border-white/10 bg-black/40 text-black focus:ring-white/20 accent-white"
                                    />
                                </th>
                                <th className="px-6 py-5 font-bold">#</th>
                                <th className="px-6 py-5 font-bold">Title</th>
                                <th className="px-6 py-5 font-bold text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-zinc-300">
                            {chapters.map((chapter) => (
                                <tr key={chapter._id} className="hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedChapters.has(chapter._id)}
                                            onChange={() => toggleSelect(chapter._id)}
                                            className="rounded border-white/10 bg-black/40 text-black focus:ring-white/20 accent-white"
                                        />
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-white tracking-wide">{chapter.chapter_number}</td>
                                    <td className="px-6 py-4 text-sm font-medium">{chapter.title}</td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                                        <button
                                            onClick={() => handleReorderClick(chapter._id)}
                                            className="text-zinc-400 hover:text-white border border-white/10 hover:border-white/30 hover:bg-white/10 rounded-xl px-3 py-1.5 text-xs transition-colors font-medium tracking-wide"
                                        >
                                            Quản lý ảnh
                                        </button>
                                        <button
                                            onClick={() => handleUploadClick(chapter._id)}
                                            className="text-zinc-400 hover:text-white border border-white/10 hover:border-white/30 hover:bg-white/10 rounded-xl px-3 py-1.5 text-xs transition-colors font-medium tracking-wide"
                                        >
                                            Upload
                                        </button>
                                        <button
                                            onClick={() => handleDelete(chapter._id)}
                                            className="text-zinc-400 hover:text-red-400 border border-white/10 hover:border-red-500/30 hover:bg-red-500/10 rounded-xl px-3 py-1.5 text-xs transition-colors font-medium tracking-wide"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {chapters.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-16 text-center text-zinc-500 text-sm tracking-wide">
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
