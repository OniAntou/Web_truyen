import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Flag } from 'lucide-react';
import { slugify } from '../../utils/format';

interface ReaderHeaderProps {
    comicId: string;
    comicTitle: string;
    chapterTitle: string;
    onOpenReport: () => void;
}

const ReaderHeader: React.FC<ReaderHeaderProps> = ({
    comicId,
    comicTitle,
    chapterTitle,
    onOpenReport
}) => {
    return (
        <div className="reader-info-bar">
            <div className="reader-info-content">
                <Link to={`/p/${slugify(comicTitle)}-${comicId}`} className="reader-info-back" title={comicTitle}>
                    <ArrowLeft size={16} />
                    <span className="reader-info-back-title">{comicTitle}</span>
                </Link>

                {chapterTitle && (
                    <span className="reader-info-center-chapter">
                        {chapterTitle}
                    </span>
                )}

                {chapterTitle && <div className="reader-info-spacer"></div>}

                <button 
                    onClick={onOpenReport}
                    className="flex items-center gap-2 text-zinc-500 hover:text-rose-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-rose-500/10 text-xs font-medium"
                    title="Báo lỗi chương"
                >
                    <Flag size={14} />
                    <span className="hidden sm:inline">Báo lỗi</span>
                </button>
            </div>
        </div>
    );
};

export default ReaderHeader;
