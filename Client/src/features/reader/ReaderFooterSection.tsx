import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';

interface ReaderFooterSectionProps {
    comicId: string;
    hasPrev: boolean;
    hasNext: boolean;
    onPrev: () => void;
    onNext: () => void;
}

const ReaderFooterSection: React.FC<ReaderFooterSectionProps> = ({
    comicId,
    hasPrev,
    hasNext,
    onPrev,
    onNext
}) => {
    return (
        <div className="reader-end-section">
            <div className="reader-end-inner">
                <div className="reader-end-actions">
                    <button 
                        onClick={onPrev}
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
                        onClick={onNext}
                        className={`reader-end-btn reader-end-btn-primary ${!hasNext ? 'reader-end-btn-disabled' : ''}`}
                        disabled={!hasNext}
                    >
                        Next
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReaderFooterSection;
