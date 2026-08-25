import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { Link } from "react-router-dom";
import { comicService } from "../../services/comicService";
import { slugify } from "../../utils/format";
import { useDialogA11y } from "../../hooks/useDialogA11y";
import { useAutoHideOnScroll } from "../../hooks/useAutoHideOnScroll";
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
    /** Trang đang xem trong chapter (để hiển thị vị trí). */
    currentPage?: number;
    totalPages?: number;
}

const ReaderControls: React.FC<ReaderControlsProps> = ({ comicId, comicTitle, chapters, currentChapterId, onPrev, onNext, currentPage = 1, totalPages = 0 }) => {
  const [showChapters, setShowChapters] = useState(false);
  const [chaptersWithStatus, setChaptersWithStatus] = useState<ReaderChapter[]>([]);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const activeChapterRef = useRef<HTMLAnchorElement>(null);
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  // Auto-hide pill khi đang cuộn xuống đọc, hiện lại khi cuộn lên
  const controlsHidden = useAutoHideOnScroll();
  const chaptersDialogRef = useDialogA11y<HTMLDivElement>(showChapters, () => setShowChapters(false));

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
      <div className={`reader-controls-fixed ${controlsHidden ? 'reader-controls-hidden' : ''}`}>
        <div className="reader-controls-bar glass-panel shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
          <button
            type="button"
            onClick={onPrev}
            className="control-btn hover:text-[var(--accent)] transition-colors"
            title="Chapter trước"
            aria-label="Chapter trước"
          >
            <ArrowLeft size={22} strokeWidth={2.5} />
          </button>

          <button
            type="button"
            onClick={() => setShowChapters(true)}
            className="px-6 py-2 rounded-full font-bold text-sm tracking-wide whitespace-nowrap transition-colors border"
            style={{ background: 'var(--glass-bg)', color: 'var(--text-primary)', borderColor: 'var(--glass-border)' }}
            title="Danh sách chapter"
            aria-label="Mở danh sách chapter"
          >
            {currentChapter
                ? `Chapter ${currentChapter.chapter_number}${totalPages > 0 ? ` · Trang ${Math.min(Math.max(currentPage, 1), totalPages)}/${totalPages}` : ''}`
                : 'Danh sách chapter'}
          </button>

          <button
            type="button"
            onClick={onNext}
            className="control-btn hover:text-[var(--accent)] transition-colors"
            title="Chapter sau"
            aria-label="Chapter sau"
          >
            <ArrowRight size={22} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {showChapters && (
          <div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm"
            onClick={() => setShowChapters(false)}
          >
          <div
            ref={chaptersDialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Danh sách chapter"
            className="border rounded-[2rem] w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden shadow-2xl relative"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b flex justify-between items-center sticky top-0 z-10" style={{ borderColor: 'var(--border)' }}>
              <h3 className="font-bold text-xl tracking-tight" style={{ color: 'var(--text-primary)' }}>Danh sách chapter</h3>
              <button
                type="button"
                onClick={() => setShowChapters(false)}
                className="reader-icon-btn transition-colors p-2 rounded-full"
                style={{ color: 'var(--text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto p-4 flex-1 custom-scrollbar">
              {loadingStatus ? (
                <div className="py-20 text-center italic font-medium animate-pulse" style={{ color: 'var(--text-secondary)' }}>Đang tải trạng thái...</div>
              ) : displayChapters && displayChapters.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {[...displayChapters].reverse().map((ch) => {
                    const isActive = ch._id === currentChapterId || ch.id === currentChapterId;
                    return (
                      <Link
                        key={ch._id || ch.id}
                        to={`/read/${slugify(comicTitle)}-${comicId}/${ch._id || ch.id}`}
                        onClick={() => setShowChapters(false)}
                        ref={isActive ? activeChapterRef : null}
                        className={`px-5 py-4 rounded-2xl transition-all duration-300 flex justify-between items-center border ${
                          isActive
                            ? 'font-bold scale-[1.02]'
                            : ch.isRead
                            ? 'hover:brightness-110'
                            : 'hover:brightness-125'
                        }`}
                        style={{
                          background: isActive ? 'var(--accent-hover)' : 'var(--bg-card)',
                          color: isActive ? '#ffffff' : ch.isRead ? 'var(--text-secondary)' : 'var(--text-primary)',
                          borderColor: isActive ? 'transparent' : 'var(--border)'
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="truncate max-w-[200px]">{ch.title || `Chapter ${ch.chapter_number}`}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {ch.isRead && !isActive && <span className="w-2 h-2 rounded-full bg-green-500 opacity-50"></span>}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="py-20 text-center italic" style={{ color: 'var(--text-secondary)' }}>Chưa có chapter nào</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReaderControls;
