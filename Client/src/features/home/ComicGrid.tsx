import { Link } from 'react-router-dom';
import ComicCard from '../../components/ui/ComicCard';
import { Comic } from '../../types/comic';

interface ComicGridProps {
    title: string;
    comics: Comic[];
    linkTo?: string;
    showHoverStats?: boolean;
    hideTitle?: boolean;
}

const ComicGrid: React.FC<ComicGridProps> = ({ 
    title, 
    comics, 
    linkTo = "/popular", 
    showHoverStats = false,
    hideTitle = false
}) => {
    // Show only standard amount for grids
    const displayComics = comics.slice(0, 30);
    
    return (
        <section className="container mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-16">
            {!hideTitle && (
                <div className="mb-7 flex items-end justify-between gap-4 md:mb-9">
                    <div className="flex flex-col gap-2">
                        <span className="text-[0.65rem] font-bold uppercase tracking-[0.24em]" style={{ color: 'var(--accent)' }}>Khám phá mỗi ngày</span>
                        <h2 className="text-2xl font-bold tracking-tight md:text-4xl" style={{ color: 'var(--text-primary)' }}>
                            {title}
                        </h2>
                    </div>
                    <Link to={linkTo} className="shrink-0 rounded-full border border-[var(--border)] px-4 py-2 text-[0.65rem] font-bold uppercase tracking-widest transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]" style={{ color: 'var(--text-secondary)' }}>
                        Xem tất cả
                    </Link>
                </div>
            )}

            {displayComics.length > 0 ? (
                <div className="comic-rail -mx-5 flex snap-x gap-4 overflow-x-auto px-5 pb-4 md:mx-0 md:grid md:grid-cols-4 md:gap-x-5 md:gap-y-10 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-5 xl:grid-cols-6">
                    {displayComics.map(comic => (
                        <div key={comic.id || comic._id} className="w-[142px] shrink-0 snap-start md:w-auto">
                            <ComicCard comic={comic} showHoverStats={showHoverStats} />
                        </div>
                    ))}
                </div>
            ) : (
                <p className="rounded-2xl border border-dashed border-[var(--border)] px-5 py-10 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>Chưa có truyện trong mục này.</p>
            )}
        </section>
    );
};

export default ComicGrid;
