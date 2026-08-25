import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, BookOpen, CheckCircle2 } from 'lucide-react';
import { slugify } from '../../utils/format';

interface ReaderFooterSectionProps {
    comicId: string;
    comicTitle: string;
    hasPrev: boolean;
    hasNext: boolean;
    onPrev: () => void;
    onNext: () => void;
    /** Số chương vừa đọc xong — hiện badge peak-end khi có. */
    chapterNumber?: number;
}

const ReaderFooterSection: React.FC<ReaderFooterSectionProps> = ({
    comicId,
    comicTitle,
    hasPrev,
    hasNext,
    onPrev,
    onNext,
    chapterNumber
}) => {
    return (
        <div className="reader-end-section">
            <div className="reader-end-inner">
                {chapterNumber != null && (
                    <div className="reader-end-moment">
                        <span className="reader-end-badge">
                            <CheckCircle2 size={14} aria-hidden="true" />
                            Đọc xong Chương {chapterNumber}
                        </span>
                        <p className="reader-end-title">Chương tiếp theo đang chờ bạn.</p>
                    </div>
                )}
                <div className="reader-end-actions">
                    <button
                        type="button"
                        onClick={onPrev}
                        className={`reader-end-btn reader-end-btn-secondary ${!hasPrev ? 'reader-end-btn-disabled' : ''}`}
                        disabled={!hasPrev}
                    >
                        <ChevronLeft size={18} />
                        Chương trước
                    </button>
                    <Link to={`/p/${slugify(comicTitle)}-${comicId}`} className="reader-end-btn reader-end-btn-outline">
                        <BookOpen size={16} />
                        Thông tin truyện
                    </Link>
                    <button
                        type="button"
                        onClick={onNext}
                        className={`reader-end-btn reader-end-btn-primary ${!hasNext ? 'reader-end-btn-disabled' : ''}`}
                        disabled={!hasNext}
                    >
                        Chương sau
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReaderFooterSection;
