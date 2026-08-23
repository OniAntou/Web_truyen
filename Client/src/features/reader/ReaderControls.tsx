import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { Link } from "react-router-dom";
import { comicService } from "../../services/comicService";
import { slugify } from "../../utils/format";
import { Chapter } from "../../types/comic";

interface ReaderChapter extends Chapter {
    isRead?: boolean;
    hasProgress?: boolean;
    currentPage?: number;
}

interface ReaderControlsProps {
    comicId: string;
    comicTitle: string;
    chapters: Chapter[];
    currentChapterId: string;
    onPrev: () => void;
    onNext: () => void;
}

const ReaderControls: React.FC<ReaderControlsProps> = ({ comicId, comicTitle, chapters, currentChapterId, onPrev, onNext }) => {
  const [showChapters, setShowChapters] = useState(false);
  const [chaptersWithStatus, setChaptersWithStatus] = useState<ReaderChapter[]>([]);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const activeChapterRef = useRef<HTMLAnchorElement>(null);
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  const currentChapter = chapters?.find(ch => (ch._id || ch.id) === currentChapterId);

  // Fetch chapter read status when modal opens
  useEffect(() => {
    if (showChapters && user && comicId && chapters) {
      comicService.getChaptersReadStatus(comicId)
      .then(data => {
        setChaptersWithStatus(data);
        setLoadingStatus(false);
      })
      .catch((err: unknown) => {
        console.error('Error fetching chapter read status:', err);
        setLoadingStatus(false);
      });
    }
  }, [showChapters, comicId, chapters, user]);

  // Merge chapters with status info
  const displayChapters: ReaderChapter[] = chapters ? chapters.map(chapter => {
    const statusInfo = chaptersWithStatus.find(s => s._id === (chapter._id || chapter.id));
    return {
      ...chapter,
      isRead: statusInfo ? statusInfo.isRead : false,
      hasProgress: statusInfo ? statusInfo.hasProgress : false,
      currentPage: statusInfo ? statusInfo.currentPage : 0
    };
  }) : [];

  // Auto scroll to active chapter when modal opens
  useEffect(() => {
    if (showChapters && activeChapterRef.current) {
      activeChapterRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [showChapters]);

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 transition-all duration-300">
        <div className="flex items-center gap-2 p-1.5 rounded-full bg-[var(--glass-bg)] backdrop-blur-2xl border border-[var(--glass-border)] shadow-2xl shadow-black/20">
          <button
            onClick={onPrev}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] active:scale-95 transition-all"
            title="Chương trước"
            aria-label="Chương trước"
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>

          <button
            onClick={() => setShowChapters(true)}
            className="px-5 py-2 rounded-full text-[var(--text-primary)] font-extrabold text-xs tracking-wider uppercase bg-[var(--bg-secondary)] hover:bg-[var(--bg-elevated)] border border-[var(--border)] transition-all whitespace-nowrap shadow-inner"
            title="Danh sách chương"
          >
            {currentChapter ? `Chương ${currentChapter.chapter_number}` : 'Danh sách chương'}
          </button>

          <button 
            onClick={onNext} 
            className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] active:scale-95 transition-all"
            title="Chương sau"
            aria-label="Chương sau"
          >
            <ArrowRight size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {showChapters && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-md animate-fade-in"
          onClick={() => setShowChapters(false)}
        >
          <div
            className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-3xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden shadow-2xl relative animate-slide-up-fade"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg-secondary)]">
              <h3 className="text-[var(--text-primary)] font-extrabold text-base tracking-tight">Danh Sách Chương</h3>
              <button
                onClick={() => setShowChapters(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-[var(--bg-primary)] p-1.5 rounded-full border border-[var(--border)] transition-colors"
                aria-label="Đóng"
              >
                <X size={16} />
              </button>
            </div>

            <div className="overflow-y-auto p-4 flex-1 custom-scrollbar">
              {loadingStatus ? (
                <div className="py-16 text-center text-xs font-semibold text-[var(--text-secondary)] animate-pulse">Đang tải trạng thái...</div>
              ) : displayChapters && displayChapters.length > 0 ? (
                <div className="flex flex-col gap-1.5">
                  {[...displayChapters].reverse().map((ch) => {
                    const isActive = ch._id === currentChapterId || ch.id === currentChapterId;
                    return (
                      <Link
                        key={ch._id || ch.id}
                        to={`/read/${slugify(comicTitle)}-${comicId}/${ch._id || ch.id}`}
                        onClick={() => setShowChapters(false)}
                        ref={isActive ? activeChapterRef : null}
                        className={`px-4 py-3 rounded-2xl transition-all duration-200 flex justify-between items-center text-xs font-bold border ${
                          isActive
                            ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-md shadow-[var(--accent)]/30'
                            : ch.isRead
                            ? 'text-[var(--text-muted)] bg-[var(--bg-secondary)]/50 border-transparent hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]'
                            : 'text-[var(--text-primary)] bg-[var(--bg-secondary)] border-[var(--border)] hover:border-[var(--accent)]/50 hover:bg-[var(--bg-elevated)]'
                        }`}
                      >
                        <span className="truncate">{ch.title || `Chương ${ch.chapter_number}`}</span>
                        {ch.isRead && !isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>}
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="py-16 text-center text-xs text-[var(--text-secondary)] italic">Chưa có chương nào</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReaderControls;
