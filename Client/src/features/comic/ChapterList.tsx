import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ListOrdered, Coins } from 'lucide-react';
import { slugify } from '../../utils/format';
import { useAuthStore } from '../../store/authStore';

import { Chapter } from '../../types/comic';

interface ChapterListProps {
    chapters: Chapter[];
    comicId: string;
    comicTitle: string;
}

const ChapterList: React.FC<ChapterListProps> = ({ chapters, comicId, comicTitle }) => {
    const [readChapters, setReadChapters] = useState<Set<string>>(new Set());
    const user = useAuthStore(state => state.user);

    useEffect(() => {
        const userId = user?.id || user?._id || 'guest';
        const storageKey = `read-chapters-${userId}-${comicId}`;
        
        const stored = localStorage.getItem(storageKey);
        if (stored) {
            try {
                setReadChapters(new Set(JSON.parse(stored)));
            } catch (e) {
                console.error(e);
            }
        }
    }, [comicId, user]);

    const handleChapterClick = (chapter: Chapter) => {
        if (chapter.is_locked) return;

        const chapterId = chapter._id || chapter.id;
        if (!chapterId) return;

        const newReadChapters = new Set(readChapters);
        newReadChapters.add(chapterId);
        setReadChapters(newReadChapters);

        const userId = user?.id || user?._id || 'guest';
        const storageKey = `read-chapters-${userId}-${comicId}`;
        localStorage.setItem(storageKey, JSON.stringify([...newReadChapters]));
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl mt-12 mb-16">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-[var(--border)]">
                <div className="flex items-center gap-2.5">
                    <ListOrdered size={20} className="text-[var(--accent)]" />
                    <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
                        Danh Sách Chương
                    </h3>
                </div>
                <span className="text-xs font-bold text-[var(--text-secondary)] px-3 py-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)]">
                    {chapters.length} chương
                </span>
            </div>

            <div className="rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border)] p-4 sm:p-6 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                    {[...chapters].reverse().map(chapter => {
                        const chapterId = chapter._id || chapter.id;
                        if (!chapterId) return null;
                        const isRead = readChapters.has(chapterId);
                        const requiresPayment = (chapter.price || 0) > 0 && (!chapter.early_access_end_date || new Date(chapter.early_access_end_date) > new Date());
                        const displayLockedInfo = chapter.is_locked || requiresPayment;
                        
                        return (
                            <Link
                                key={chapterId}
                                to={`/read/${slugify(comicTitle)}-${comicId}/${chapterId}`}
                                className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-200 select-none group ${
                                    isRead 
                                        ? 'bg-[var(--bg-primary)]/40 border-[var(--border)] opacity-60 hover:opacity-100' 
                                        : 'bg-[var(--bg-card)] border-[var(--border)] hover:border-[var(--accent)]/50 hover:bg-[var(--bg-elevated)] hover:-translate-y-0.5 shadow-sm'
                                }`}
                                onClick={() => handleChapterClick(chapter)}
                            >
                                <div className="flex items-center gap-2 min-w-0 pr-2">
                                    {isRead ? (
                                        <CheckCircle2 size={15} className="text-[var(--accent)] shrink-0" />
                                    ) : (
                                        <div className="w-2 h-2 rounded-full bg-[var(--accent)] opacity-40 group-hover:opacity-100 group-hover:scale-125 transition-all shrink-0" />
                                    )}
                                    <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] truncate transition-colors">
                                        {chapter.title || `Chương ${chapter.chapter_number}`}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    {displayLockedInfo && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
                                            <Coins size={10} />
                                            <span>{chapter.price || 0} Xu</span>
                                        </span>
                                    )}
                                    {chapter.date && (
                                        <span className="text-[10px] font-semibold text-[var(--text-muted)]">
                                            {chapter.date}
                                        </span>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ChapterList;
