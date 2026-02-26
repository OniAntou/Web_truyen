import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight, ChevronLeft, BookOpen, Home } from 'lucide-react';
import Navbar from '../components/Layout/Navbar';
import ReaderControls from '../components/Reader/ReaderControls';
import Footer from '../components/Layout/Footer';

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

        fetch(`http://localhost:5000/api/comics/${comicId}`)
            .then(res => {
                if (!res.ok) throw new Error('Comic not found');
                return res.json();
            })
            .then(data => {
                setComic(data);
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

    const currentIndex = comic?.chapters?.findIndex(c => c._id === chapter?._id) ?? -1;
    const hasPrev = currentIndex > 0;
    const hasNext = comic?.chapters && currentIndex < comic.chapters.length - 1;

    const handleNextChapter = () => {
        if (!comic || !chapter || !hasNext) return;
        const nextChapter = comic.chapters[currentIndex + 1];
        navigate(`/read/${comicId}/${nextChapter._id}`);
    };

    const handlePrevChapter = () => {
        if (!comic || !chapter || !hasPrev) return;
        const prevChapter = comic.chapters[currentIndex - 1];
        navigate(`/read/${comicId}/${prevChapter._id}`);
    };

    if (loading) return <div style={{ paddingTop: '5rem', textAlign: 'center', color: 'white' }}>Loading...</div>;
    if (error) return <div style={{ paddingTop: '5rem', textAlign: 'center', color: 'red' }}>Error: {error}</div>;
    if (!comic || !chapter) return <div style={{ paddingTop: '5rem', textAlign: 'center', color: 'white' }}>Content not found</div>;

    const pages = chapter.pages || [];

    return (
        <div className="reader-page">
            <Navbar />

            {/* Reader Info Bar */}
            <div className="reader-info-bar">
                <div className="reader-info-content">
                    <Link to={`/p/${comicId}`} className="reader-info-back" title="Back to Comic">
                        <ArrowLeft size={16} />
                        {comic.title}
                    </Link>

                    {chapter.title && (
                        <span className="reader-info-center-chapter">
                            {chapter.title}
                        </span>
                    )}

                    {chapter.title && <div className="reader-info-spacer"></div>}
                </div>
            </div>

            {/* Reader Content */}
            <div className="reader-container reader-container-spacing">
                {pages.length > 0 ? (
                    pages.map((page, index) => (
                        <div key={index}>
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

                <ReaderControls 
                    comicId={comicId} 
                    chapters={comic?.chapters || []}
                    currentChapterId={chapter?._id}
                    onPrev={handlePrevChapter} 
                    onNext={handleNextChapter} 
                />
            </div>
        
            {/* End of Chapter */}
            <div className="reader-end-section">
                <div className="reader-end-inner">
                    <div className="reader-end-actions">
                        <button 
                            onClick={handlePrevChapter}
                            className={`reader-end-btn reader-end-btn-secondary ${!hasPrev ? 'reader-end-btn-disabled' : ''}`}
                            disabled={!hasPrev}
                        >
                            <ChevronLeft size={18} />
                            Previous
                        </button>
                        <Link to={`/p/${comicId}`} className="reader-end-btn reader-end-btn-outline">
                            <BookOpen size={16} />
                            Comic Info
                        </Link>
                        <button 
                            onClick={handleNextChapter}
                            className={`reader-end-btn reader-end-btn-primary ${!hasNext ? 'reader-end-btn-disabled' : ''}`}
                            disabled={!hasNext}
                        >
                            Next
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default ReadPage;

