import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';

const ChapterList = ({ chapters, comicId }) => {
    const [readChapters, setReadChapters] = useState(new Set());
    const [isDarkTheme, setIsDarkTheme] = useState(true);

    useEffect(() => {
        // Load read chapters from localStorage with user context
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        const userId = user?.id || user?._id || 'guest';
        const storageKey = `read-chapters-${userId}-${comicId}`;
        
        const stored = localStorage.getItem(storageKey);
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

    const handleChapterClick = (chapter) => {
        // Don't mark locked chapters as read — user can't actually read them
        if (chapter.is_locked) return;

        const chapterId = chapter._id || chapter.id;
        const newReadChapters = new Set(readChapters);
        newReadChapters.add(chapterId);
        setReadChapters(newReadChapters);
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        const userId = user?.id || user?._id || 'guest';
        const storageKey = `read-chapters-${userId}-${comicId}`;
        
        // Save to localStorage
        localStorage.setItem(storageKey, JSON.stringify([...newReadChapters]));
    };

    return (
        <div className="container" style={{ marginTop: '3rem', paddingBottom: '2rem' }}>
            <h3 className="section-title" style={{ marginBottom: '1.5rem' }}>Danh Sách Chapter</h3>
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
                                onClick={() => handleChapterClick(chapter)}
                            >
                                <span className="chapter-title flex items-center gap-2">
                                    {chapter.title}
                                    {chapter.is_locked && (
                                        <span className="flex items-center text-[0.65rem] font-bold text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded border border-yellow-500/20 ml-2">
                                            <Lock size={10} className="mr-1" />
                                            {chapter.price || 0} Xu
                                        </span>
                                    )}
                                </span>
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
