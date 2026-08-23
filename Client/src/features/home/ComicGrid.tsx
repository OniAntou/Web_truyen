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
        <section className="container mx-auto px-4 sm:px-6 py-10 sm:py-14 max-w-7xl">
            {!hideTitle && (
                <div className="flex items-end justify-between mb-6 sm:mb-8 pb-3 border-b border-[var(--border)]">
                    <div className="flex items-center gap-2.5">
                        <div className="w-1.5 h-6 rounded-full bg-[var(--accent)]" />
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
                            {title}
                        </h2>
                    </div>
                    <Link 
                        to={linkTo} 
                        className="group inline-flex items-center gap-1 text-xs font-bold tracking-wider uppercase text-[var(--accent)] hover:opacity-80 transition-all"
                    >
                        <span>Xem tất cả</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </Link>
                </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-5 md:gap-6">
                {displayComics.map(comic => (
                    <div key={comic.id || comic._id} className="w-full">
                        <ComicCard comic={comic} showHoverStats={showHoverStats} />
                    </div>
                ))}
            </div>
        </section>
    );
};

export default ComicGrid;
