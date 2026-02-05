import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReaderControls from '../components/Reader/ReaderControls';

const ReadPage = () => {
    const { comicId, chapterId } = useParams();
    const navigate = useNavigate();
    const [comic, setComic] = useState(null);
    const [chapter, setChapter] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        setLoading(true);
        setError(null);

        // Fetch comic details which includes chapters and pages
        fetch(`http://localhost:5000/api/comics/${comicId}`)
            .then(res => {
                if (!res.ok) throw new Error('Comic not found');
                return res.json();
            })
            .then(data => {
                setComic(data);
                
                // Find current chapter
                // Note: The backend sorts chapters ascending (oldest first usually)
                // chapter_number is usually consistent
                if (data.chapters) {
                    const found = data.chapters.find(c => c._id === chapterId || c.id === chapterId);
                    if (found) {
                        setChapter(found);
                    } else {
                        setError('Chapter not found');
                    }
                } else {
                    setError('No chapters found');
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError(err.message);
                setLoading(false);
            });
    }, [comicId, chapterId]);

    const handleNextChapter = () => {
        if (!comic || !chapter) return;
        const currentIndex = comic.chapters.findIndex(c => c._id === chapter._id);
        if (currentIndex < comic.chapters.length - 1) {
            const nextChapter = comic.chapters[currentIndex + 1];
            navigate(`/read/${comicId}/${nextChapter._id}`);
        } else {
            alert('This is the latest chapter.');
        }
    };

    const handlePrevChapter = () => {
        if (!comic || !chapter) return;
        const currentIndex = comic.chapters.findIndex(c => c._id === chapter._id);
        if (currentIndex > 0) {
            const prevChapter = comic.chapters[currentIndex - 1];
            navigate(`/read/${comicId}/${prevChapter._id}`);
        } else {
            alert('This is the first chapter.');
        }
    };

    if (loading) return <div style={{ paddingTop: '5rem', textAlign: 'center', color: 'white' }}>Loading...</div>;
    if (error) return <div style={{ paddingTop: '5rem', textAlign: 'center', color: 'red' }}>Error: {error}</div>;
    if (!comic || !chapter) return <div style={{ paddingTop: '5rem', textAlign: 'center', color: 'white' }}>Content not found</div>;

    const pages = chapter.pages || [];

    return (
        <div className="reader-container">
            {/* Pages */}
            {pages.length > 0 ? (
                pages.map((page, index) => (
                    <div key={index} style={{ marginBottom: '0.5rem' }}>
                        <img
                            src={page.image_url}
                            alt={`Page ${index + 1}`}
                            className="reader-page-img"
                            loading="lazy"
                        />
                    </div>
                ))
            ) : (
                <div style={{ padding: '4rem', textAlign: 'center', color: 'gray' }}>
                    <p>No images in this chapter.</p>
                </div>
            )}

            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <p>End of Chapter {chapter.chapter_number}</p>
                <div className="flex justify-center gap-4 mt-4">
                     <button 
                        onClick={handlePrevChapter}
                        className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 text-white"
                     >
                        Previous
                     </button>
                     <button 
                        onClick={handleNextChapter}
                        className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-700 text-white"
                     >
                        Next
                     </button>
                </div>
            </div>
            
            {/* We passed comicId to controls, but let's just make controls simpler or keep as is */}
            <ReaderControls comicId={comicId} />
        </div>
    );
};

export default ReadPage;
