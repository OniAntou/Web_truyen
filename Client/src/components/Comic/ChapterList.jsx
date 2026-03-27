import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ChapterList = ({ chapters, comicId }) => {
    const [readChapters, setReadChapters] = useState(new Set());
    const [isDarkTheme, setIsDarkTheme] = useState(true);

    useEffect(() => {
        // Load read chapters from localStorage
        const stored = localStorage.getItem(`read-chapters-${comicId}`);
        if (stored) {
            setReadChapters(new Set(JSON.parse(stored)));
        }

        // Check current theme
        const checkTheme = () => {
            setIsDarkTheme(document.documentElement.getAttribute('data-theme') !== 'light');
        };
        
        checkTheme();
        
        // Listen for theme changes
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        
        return () => observer.disconnect();
    }, [comicId]);

    const handleChapterClick = (chapterId) => {
        // Mark chapter as read
        const newReadChapters = new Set(readChapters);
        newReadChapters.add(chapterId);
        setReadChapters(newReadChapters);
        
        // Save to localStorage
        localStorage.setItem(`read-chapters-${comicId}`, JSON.stringify([...newReadChapters]));
    };

    return (
        <div className="container" style={{ marginTop: '3rem', paddingBottom: '2rem' }}>
            <h3 className="section-title" style={{ marginBottom: '1.5rem' }}>Danh Sách Chương</h3>
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
                <div className="chapter-list-grid">
                    {chapters.map(chapter => {
                        const chapterId = chapter._id || chapter.id;
                        const isRead = readChapters.has(chapterId);
                        
                        return (
                            <Link
                                key={chapterId}
                                to={`/read/${comicId}/${chapterId}`}
                                className={`chapter-item ${isRead ? 'chapter-read' : 'chapter-unread'}`}
                                style={{
                                    background: isRead 
                                        ? isDarkTheme 
                                            ? 'rgba(255, 255, 255, 0.08)' 
                                            : 'rgba(0, 0, 0, 0.08)'
                                        : 'transparent',
                                    border: isRead 
                                        ? isDarkTheme 
                                            ? '1px solid rgba(255, 255, 255, 0.15)' 
                                            : '1px solid rgba(0, 0, 0, 0.15)'
                                        : isDarkTheme 
                                            ? '1px solid rgba(255, 255, 255, 0.05)' 
                                            : '1px solid rgba(0, 0, 0, 0.05)'
                                }}
                                onClick={() => handleChapterClick(chapterId)}
                            >
                                <span className="chapter-title">{chapter.title}</span>
                                <span className="chapter-date">{chapter.date}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ChapterList;
