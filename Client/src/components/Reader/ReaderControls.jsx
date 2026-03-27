import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { Link } from "react-router-dom";
import { comicService } from "../../api/comicService";

const ReaderControls = ({ comicId, chapters, currentChapterId, onPrev, onNext }) => {
  const [showChapters, setShowChapters] = useState(false);
  const [chaptersWithStatus, setChaptersWithStatus] = useState([]);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const activeChapterRef = useRef(null);
  const token = localStorage.getItem('token');

  const currentChapter = chapters?.find(ch => (ch._id || ch.id) === currentChapterId);

  // Fetch chapter read status when modal opens
  useEffect(() => {
    if (showChapters && token && comicId && chapters) {
      comicService.getChaptersReadStatus(comicId, token)
      .then(data => {
        setChaptersWithStatus(data);
        setLoadingStatus(false);
      })
      .catch(err => {
        console.error('Error fetching chapter read status:', err);
        setLoadingStatus(false);
      });
    }
  }, [showChapters, comicId, chapters, token]);

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
        <div className="reader-controls-bar">
          <button
            onClick={onPrev}
            className="control-btn"
            title="Previous Chapter"
          >
            <ArrowLeft size={24} />
          </button>

          <button
            onClick={() => setShowChapters(true)}
            className="control-btn px-4 text-white font-medium whitespace-nowrap"
            title="Chapter List"
          >
            {currentChapter ? `Chapter ${currentChapter.chapter_number}` : 'Chapters'}
          </button>



          <button onClick={onNext} className="control-btn" title="Next Chapter">
            <ArrowRight size={24} />
          </button>
        </div>
      </div>

      {showChapters && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          onClick={() => setShowChapters(false)}
        >
          <div
            className="bg-gray-900 border border-gray-700/50 rounded-xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-gray-700/50 flex justify-between items-center bg-gray-800/80">
              <h3 className="text-white font-semibold text-lg">Chapters</h3>
              <button
                onClick={() => setShowChapters(false)}
                className="text-gray-400 hover:text-white transition-colors bg-gray-800 p-1.5 rounded-full hover:bg-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto p-3 flex-1 custom-scrollbar">
              {loadingStatus ? (
                <div className="py-10 text-center text-gray-500 italic">Loading chapter status...</div>
              ) : displayChapters && displayChapters.length > 0 ? (
                <div className="flex flex-col gap-1.5">
                  {[...displayChapters].reverse().map((ch) => {
                    const isActive = ch._id === currentChapterId || ch.id === currentChapterId;
                    return (
                      <Link
                        key={ch._id || ch.id}
                        to={`/read/${comicId}/${ch._id || ch.id}`}
                        onClick={() => setShowChapters(false)}
                        ref={isActive ? activeChapterRef : null}
                        className={`px-4 py-3 rounded-lg transition-all flex justify-between items-center cursor-pointer ${
                          isActive
                            ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30 font-medium'
                            : ch.isRead
                            ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-300 border border-transparent'
                            : 'text-gray-300 hover:bg-gray-800 hover:text-white border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>Chapter {ch.chapter_number} {ch.title ? `: ${ch.title}` : ''}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {isActive && <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full font-semibold">Current</span>}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="py-10 text-center text-gray-500 italic">No chapters available</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReaderControls;
