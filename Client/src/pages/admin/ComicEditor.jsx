import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API_BASE_URL } from '../../constants/api';

const ComicEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [formData, setFormData] = useState({
        title: '',
        author: '',
        artist: '',
        status: 'Ongoing',
        cover_url: '',
        description: '',
        genres: '',
    });
    const [coverFile, setCoverFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

    const fetchComic = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/comics/${id}`);
            const data = await response.json();
            setFormData({
                ...data,
                genres: Array.isArray(data.genres) 
                    ? data.genres.map(g => typeof g === 'object' && g.name ? g.name : g).join(', ') 
                    : data.genres
            });
            // Display existing cover if available
            // If data.cover_url is a full R2 url (or resolved one), show it
            if (data.cover_url) {
                setPreviewUrl(data.cover_url);
            }
        } catch (error) {
            console.error('Error fetching comic:', error);
        }
    };

    useEffect(() => {
        if (isEditing) {
            fetchComic();
        }
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverFile(file);
            // Create a temporary object URL for preview
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            genres: (formData.genres || '').split(',').map(g => g.trim()).filter(g => g)
        };

        try {
            // 1. Create or Update Comic first
            const url = isEditing
                ? `${API_BASE_URL}/comics/${id}`
                : `${API_BASE_URL}/comics`;
            const method = isEditing ? 'PUT' : 'POST';

            const token = localStorage.getItem('token');
            const adminData = localStorage.getItem('admin');
            const authHeader = token ? `Bearer ${token}` : ''; // Ideally admins get a token too, but we fallback

            const response = await fetch(url, {
                method,
                headers: { 
                    'Content-Type': 'application/json',
                    ...(authHeader && { 'Authorization': authHeader })
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                alert('Failed to save comic data');
                return;
            }

            const comicData = await response.json();

            // 2. Upload cover image if selected
            if (coverFile) {
                // Determine comic ID to use for upload
                // If we edited, we have 'id' from params or comicData._id
                // If we created, comicData should contain the new comic's _id (or id)
                const comicIdToUpload = comicData._id || comicData.id;

                const uploadFormData = new FormData();
                uploadFormData.append('cover', coverFile);

                const uploadResponse = await fetch(`${API_BASE_URL}/upload/cover/${comicIdToUpload}`, {
                    method: 'POST',
                    headers: {
                        ...(authHeader && { 'Authorization': authHeader })
                    },
                    body: uploadFormData
                });

                if (!uploadResponse.ok) {
                    const err = await uploadResponse.json();
                    alert('Comic saved, but image upload failed: ' + err.message);
                    // Still navigate back probably, or let user retry?
                    // For now, let's navigate back since the comic is saved
                }
            }

            const returnPath = window.location.pathname.startsWith('/studio') ? '/studio' : '/admin/comics';
            navigate(returnPath);

        } catch (error) {
            console.error('Error saving comic:', error);
            alert('An error occurred');
        }
    };

    return (
        <div className="max-w-3xl mx-auto mt-12 md:mt-16">
            <h2 className="text-3xl font-medium mb-10 text-white tracking-tight">{isEditing ? 'Edit Comic' : 'New Comic'}</h2>

            <form onSubmit={handleSubmit} className="bg-zinc-900/30 p-10 rounded-[2rem] shadow-2xl border border-white/5 space-y-8 backdrop-blur-2xl">

                {/* Title */}
                <div>
                    <label className="block text-[0.7rem] font-bold text-zinc-400 uppercase tracking-widest mb-2 ml-1">Title</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full bg-black/40 border border-white/5 text-white placeholder-zinc-600 rounded-2xl px-5 py-4 text-sm outline-none focus:bg-zinc-800/50 focus:border-white/20 transition-all duration-300"
                        required
                    />
                </div>

                {/* Author & Artist */}
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-[0.7rem] font-bold text-zinc-400 uppercase tracking-widest mb-2 ml-1">Author</label>
                        <input
                            type="text"
                            name="author"
                            value={formData.author}
                            onChange={handleChange}
                            className="w-full bg-black/40 border border-white/5 text-white placeholder-zinc-600 rounded-2xl px-5 py-4 text-sm outline-none focus:bg-zinc-800/50 focus:border-white/20 transition-all duration-300"
                        />
                    </div>
                    <div>
                        <label className="block text-[0.7rem] font-bold text-zinc-400 uppercase tracking-widest mb-2 ml-1">Artist</label>
                        <input
                            type="text"
                            name="artist"
                            value={formData.artist}
                            onChange={handleChange}
                            className="w-full bg-black/40 border border-white/5 text-white placeholder-zinc-600 rounded-2xl px-5 py-4 text-sm outline-none focus:bg-zinc-800/50 focus:border-white/20 transition-all duration-300"
                        />
                    </div>
                </div>

                {/* Status & Genres */}
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-[0.7rem] font-bold text-zinc-400 uppercase tracking-widest mb-2 ml-1">Status</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full bg-black/40 border border-white/5 text-white placeholder-zinc-600 rounded-2xl px-5 py-4 text-sm outline-none focus:bg-zinc-800/50 focus:border-white/20 transition-all duration-300"
                        >
                            <option value="Ongoing">Ongoing</option>
                            <option value="Completed">Completed</option>
                            <option value="Hiatus">Hiatus</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[0.7rem] font-bold text-zinc-400 uppercase tracking-widest mb-2 ml-1">Genres (comma separated)</label>
                        <input
                            type="text"
                            name="genres"
                            value={formData.genres}
                            onChange={handleChange}
                            className="w-full bg-black/40 border border-white/5 text-white placeholder-zinc-600 rounded-2xl px-5 py-4 text-sm outline-none focus:bg-zinc-800/50 focus:border-white/20 transition-all duration-300"
                            placeholder="Action, Fantasy..."
                        />
                    </div>
                </div>

                {/* Cover Image Upload */}
                <div>
                    <label className="block text-[0.7rem] font-bold text-zinc-400 uppercase tracking-widest mb-2 ml-1">Cover Image</label>
                    <div className="flex flex-col space-y-4">
                        {/* Preview */}
                        {previewUrl && (
                            <div className="w-full h-64 bg-black/40 rounded-2xl overflow-hidden border border-white/5 flex items-center justify-center p-2 shadow-inner">
                                <img src={previewUrl} alt="Cover Preview" className="h-full object-contain rounded-xl" />
                            </div>
                        )}

                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="w-full bg-black/40 border border-white/5 text-white placeholder-zinc-600 rounded-2xl px-5 py-4 text-sm outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-white file:text-black hover:file:bg-zinc-200 transition-all duration-300 cursor-pointer"
                        />
                        <p className="text-zinc-500 text-[0.7rem] tracking-wide ml-1">Upload an image to replace the current cover.</p>
                    </div>
                </div>

                {/* Legacy Cover URL (Optional fallback) */}
                <div>
                    <label className="block text-[0.7rem] font-bold text-zinc-400 uppercase tracking-widest mb-2 ml-1">Cover URL (Or use upload above)</label>
                    <input
                        type="text"
                        name="cover_url"
                        value={formData.cover_url}
                        onChange={handleChange}
                        className="w-full bg-black/40 border border-white/5 text-white placeholder-zinc-600 rounded-2xl px-5 py-4 text-sm outline-none focus:bg-zinc-800/50 focus:border-white/20 transition-all duration-300"
                        placeholder="http://..."
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-[0.7rem] font-bold text-zinc-400 uppercase tracking-widest mb-2 ml-1">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full bg-black/40 border border-white/5 text-white placeholder-zinc-600 rounded-2xl px-5 py-4 text-sm outline-none focus:bg-zinc-800/50 focus:border-white/20 transition-all duration-300 h-36 resize-y"
                    />
                </div>

                {/* Submit */}
                <div className="pt-6">
                    <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 text-black font-semibold py-4 rounded-2xl transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.25)] text-sm tracking-widest uppercase cursor-pointer"
                    >
                        {isEditing ? 'Update Comic' : 'Create Comic'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ComicEditor;
