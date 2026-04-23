import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { Link } from "react-router-dom";
import { comicService } from "../../api/comicService";

const ReaderControls = ({ comicId, chapters, currentChapterId, onPrev, onNext }) => {
  const [showChapters, setShowChapters] = useState(false);
  const [chaptersWithStatus, setChaptersWithStatus] = useState([]);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const activeChapterRef = useRef(null);
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
      .catch(err => {
        console.error('Error fetching chapter read status:', err);
        setLoadingStatus(false);
      });
    }
  }, [showChapters, comicId, chapters, user]);

  // Merge chapters with status info
  const displayChapters = chapters ? chapters.map(chapter => {
    const statusInfo = chaptersWithStatus.find(s => s._id === chapter._id || s._id === chapter.id);
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
      <div className="reader-controls-fixed">
        <div className="reader-controls-bar glass-panel shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
          <button
            onClick={onPrev}
            className="control-btn hover:text-[var(--accent)] transition-colors"
            title="Previous Chapter"
          >
            <ArrowLeft size={22} strokeWidth={2.5} />
          </button>

          <button
            onClick={() => setShowChapters(true)}
            className="px-6 py-2 rounded-full text-[var(--accent)] font-bold text-sm tracking-wide bg-white/5 hover:bg-white/10 transition-all border border-white/5 whitespace-nowrap"
            title="Chapter List"
          >
            {currentChapter ? `Chapter ${currentChapter.chapter_number}` : 'Danh sách chapter'}
          </button>

          <button 
            onClick={onNext} 
            className="control-btn hover:text-[var(--accent)] transition-colors" 
            title="Next Chapter"
          >
            <ArrowRight size={22} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {showChapters && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setShowChapters(false)}
        >
          <div
            className="bg-[var(--bg-secondary)] border border-white/10 rounded-[2rem] w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-white/5 backdrop-blur-md sticky top-0 z-10">
              <h3 className="text-white font-bold text-xl tracking-tight">Danh sách chapter</h3>
              <button
                onClick={() => setShowChapters(false)}
                className="text-gray-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto p-4 flex-1 custom-scrollbar">
              {loadingStatus ? (
                <div className="py-20 text-center text-[var(--text-secondary)] italic font-medium animate-pulse">Đang tải trạng thái...</div>
              ) : displayChapters && displayChapters.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {[...displayChapters].reverse().map((ch) => {
                    const isActive = ch._id === currentChapterId || ch.id === currentChapterId;
                    return (
                      <Link
                        key={ch._id || ch.id}
                        to={`/read/${comicId}/${ch._id || ch.id}`}
                        onClick={() => setShowChapters(false)}
                        ref={isActive ? activeChapterRef : null}
                        className={`px-5 py-4 rounded-2xl transition-all duration-300 flex justify-between items-center border ${
                          isActive
                            ? 'bg-[var(--accent)] text-white border-transparent shadow-lg shadow-[var(--accent)]/30 font-bold scale-[1.02]'
                            : ch.isRead
                            ? 'text-[var(--text-secondary)] bg-white/5 hover:bg-white/10 border-transparent'
                            : 'text-[var(--text-primary)] hover:bg-white/10 border-white/5'
                        }`}
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
                <div className="py-20 text-center text-[var(--text-secondary)] italic">Chưa có chapter nào</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReaderControls;
