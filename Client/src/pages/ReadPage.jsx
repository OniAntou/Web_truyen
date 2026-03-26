import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight, ChevronLeft, BookOpen, Home } from 'lucide-react';
import Navbar from '../components/Layout/Navbar';
import ReaderControls from '../components/Reader/ReaderControls';
import LazyImage from '../components/LazyImage';
import Footer from '../components/Layout/Footer';
import { CommentSection } from '../components/Comic/ComicInfo';

const ReadPage = () => {
    const { comicId, chapterId } = useParams();
    const navigate = useNavigate();
    const [comic, setComic] = useState(null);
    const [chapter, setChapter] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const token = localStorage.getItem('token');

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
                        // Fetch pages specifically for this chapter
                        fetch(`http://localhost:5000/api/chapters/${found._id}/pages`)
                            .then(res => res.json())
                            .then(pages => {
                                setChapter({ ...found, pages });
                                setLoading(false);
                            })
                            .catch(err => {
                                console.error('Error fetching pages:', err);
                                setError('Failed to load chapter pages');
                                setLoading(false);
                            });
                    } else {
                        setError('Chapter not found');
                        setLoading(false);
                    }
                } else {
                    setError('No chapters found');
                    setLoading(false);
                }
            })
            .catch(err => {
                console.error(err);
                setError(err.message);
                setLoading(false);
            });
    }, [comicId, chapterId]);

    // Track current page based on scroll position
    useEffect(() => {
        const handleScroll = () => {
            if (!chapter || !chapter.pages) return;
            
            const pageElements = document.querySelectorAll('.reader-page-img');
            const scrollTop = window.scrollY + window.innerHeight / 2; // Middle of viewport
            
            let newCurrentPage = 0;
            pageElements.forEach((element, index) => {
                const rect = element.getBoundingClientRect();
                const elementTop = rect.top + window.scrollY;
                
                if (elementTop <= scrollTop) {
                    newCurrentPage = index + 1;
                }
            });
            
            if (newCurrentPage !== currentPage) {
                setCurrentPage(newCurrentPage);
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Initial check
        
        return () => window.removeEventListener('scroll', handleScroll);
    }, [chapter, currentPage]);

    const viewedRef = React.useRef(null);

    // Mark chapter as read immediately when user opens it
    useEffect(() => {
        if (token && comic && chapter) {
            console.log('ReadPage: Chapter loaded, marking as read:', chapter.title);
            // Mark chapter as read as soon as user opens it
            updateReadingProgress(1);
        }
    }, [chapter?._id]); // Only run when chapter changes

    // Track reading progress
    const updateReadingProgress = async (pageNum) => {
        if (!token || !comic || !chapter) return;
        
        try {
            console.log('Updating reading progress:', { chapter_id: chapter._id, page_number: pageNum });
            await fetch(`http://localhost:5000/api/comics/${comicId}/reading-progress`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    chapter_id: chapter._id,
                    page_number: pageNum
                })
            });
            console.log('Reading progress updated successfully');
        } catch (err) {
            console.error('Error updating reading progress:', err);
        }
    };

    // Mark chapter as completed when user reaches the last page
    const markChapterAsCompleted = async () => {
        if (!token || !comic || !chapter) return;
        
        const totalPages = chapter.pages ? chapter.pages.length : 0;
        if (totalPages > 0 && currentPage >= totalPages) {
            // Update progress to mark chapter as fully read
            await updateReadingProgress(totalPages);
        }
    };

    // Update progress when page changes
    useEffect(() => {
        if (currentPage > 0) {
            updateReadingProgress(currentPage);
            markChapterAsCompleted();
        }
    }, [currentPage]);

    // Track comic view for authenticated users
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token && comicId && viewedRef.current !== comicId) {
            viewedRef.current = comicId;
            fetch(`http://localhost:5000/api/comics/${comicId}/view`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            }).catch(console.error);
        }
    }, [comicId]);

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
                            <LazyImage
                                src={page.image_url}
                                alt={`Page ${index + 1}`}
                                className="reader-page-img"
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

            <CommentSection comicId={comicId} chapterId={chapter._id || chapter.id} />

            <Footer />
        </div>
    );
};

export default ReadPage;

