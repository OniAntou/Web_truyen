import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

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

    useEffect(() => {
        if (isEditing) {
            fetchComic();
        }
    }, [id]);

    const fetchComic = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/comics/${id}`);
            const data = await response.json();
            setFormData({
                ...data,
                genres: Array.isArray(data.genres) ? data.genres.join(', ') : data.genres
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
            genres: formData.genres.split(',').map(g => g.trim()).filter(g => g)
        };

        try {
            // 1. Create or Update Comic first
            const url = isEditing
                ? `http://localhost:5000/api/comics/${id}`
                : 'http://localhost:5000/api/comics';
            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
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

                const uploadResponse = await fetch(`http://localhost:5000/api/upload/cover/${comicIdToUpload}`, {
                    method: 'POST',
                    body: uploadFormData
                });

                if (!uploadResponse.ok) {
                    const err = await uploadResponse.json();
                    alert('Comic saved, but image upload failed: ' + err.message);
                    // Still navigate back probably, or let user retry?
                    // For now, let's navigate back since the comic is saved
                }
            }

            navigate('/admin/comics');

        } catch (error) {
            console.error('Error saving comic:', error);
            alert('An error occurred');
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-white">{isEditing ? 'Edit Comic' : 'New Comic'}</h2>

            <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700 space-y-6">

                {/* Title */}
                <div>
                    <label className="block text-gray-400 mb-2 font-medium">Title</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                        required
                    />
                </div>

                {/* Author & Artist */}
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-gray-400 mb-2 font-medium">Author</label>
                        <input
                            type="text"
                            name="author"
                            value={formData.author}
                            onChange={handleChange}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-2 font-medium">Artist</label>
                        <input
                            type="text"
                            name="artist"
                            value={formData.artist}
                            onChange={handleChange}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                        />
                    </div>
                </div>

                {/* Status & Genres */}
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-gray-400 mb-2 font-medium">Status</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                        >
                            <option value="Ongoing">Ongoing</option>
                            <option value="Completed">Completed</option>
                            <option value="Hiatus">Hiatus</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-2 font-medium">Genres (comma separated)</label>
                        <input
                            type="text"
                            name="genres"
                            value={formData.genres}
                            onChange={handleChange}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                            placeholder="Action, Fantasy..."
                        />
                    </div>
                </div>

                {/* Cover Image Upload */}
                <div>
                    <label className="block text-gray-400 mb-2 font-medium">Cover Image</label>
                    <div className="flex flex-col space-y-3">
                        {/* Preview */}
                        {previewUrl && (
                            <div className="w-full h-64 bg-gray-900 rounded-lg overflow-hidden border border-gray-700 flex items-center justify-center">
                                <img src={previewUrl} alt="Cover Preview" className="h-full object-contain" />
                            </div>
                        )}

                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                        />
                        <p className="text-gray-500 text-sm">Upload an image to replace the current cover.</p>
                    </div>
                </div>

                {/* Legacy Cover URL (Optional fallback) */}
                <div>
                    <label className="block text-gray-400 mb-2 font-medium">Cover URL (Or use upload above)</label>
                    <input
                        type="text"
                        name="cover_url"
                        value={formData.cover_url}
                        onChange={handleChange}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                        placeholder="http://..."
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-gray-400 mb-2 font-medium">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors h-32"
                    />
                </div>

                {/* Submit */}
                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transform active:scale-95 transition-all duration-200"
                    >
                        {isEditing ? 'Update Comic' : 'Create Comic'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ComicEditor;
