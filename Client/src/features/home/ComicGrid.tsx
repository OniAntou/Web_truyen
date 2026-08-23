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
        <section className="container mx-auto px-6 py-12 md:py-16 max-w-7xl">
            {!hideTitle && (
                <div className="flex items-end justify-between mb-8 md:mb-10">
                    <h2 className="text-3xl md:text-4xl font-light tracking-tight" style={{ color: 'var(--text-primary)' }}>
                        {title}
                    </h2>
                    <Link to={linkTo} className="text-xs font-bold tracking-widest uppercase transition-colors hover:opacity-80 pb-1 border-b-2" style={{ color: 'var(--accent)', borderColor: 'var(--accent)' }}>
                        Xem Tất Cả
                    </Link>
                </div>
            )}

            <div className="flex md:grid md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-x-6 md:gap-y-10 overflow-x-auto pb-6 md:pb-0 snap-x" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {/* Custom styling to hide scrollbar while keeping functionality */}
                <style>{`
                    .overflow-x-auto::-webkit-scrollbar { display: none; }
                `}</style>
                {displayComics.map(comic => (
                    <div key={comic.id || comic._id} className="w-[140px] flex-shrink-0 md:w-auto md:flex-shrink snap-start">
                        <ComicCard comic={comic} showHoverStats={showHoverStats} />
                    </div>
                ))}
            </div>
        </section>
    );
};

export default ComicGrid;
