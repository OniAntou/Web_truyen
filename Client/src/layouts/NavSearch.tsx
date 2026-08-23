import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, X, Star } from 'lucide-react';
import { comicService } from '../services/comicService';
import { Comic, Genre } from '../types/comic';
import { useTranslation } from '../hooks/useTranslation';
import LazyImage from '../components/ui/LazyImage';
import { slugify } from '../utils/format';

interface NavSearchProps {
    onSearchComplete?: () => void;
}

const NavSearch: React.FC<NavSearchProps> = ({ onSearchComplete }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Comic[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [searching, setSearching] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearchInput = (value: string) => {
        setSearchQuery(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (!value.trim()) {
            setSearchResults([]);
            setShowDropdown(false);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            setSearching(true);
            try {
                const data = await comicService.getAll(value);
                setSearchResults((data.comics || []).slice(0, 5));
                setShowDropdown(true);
            } catch (err) {
                console.error('Search error:', err);
            } finally {
                setSearching(false);
            }
        }, 300);
    };

    const handleSearchSubmit = () => {
        if (searchQuery.trim()) {
            setShowDropdown(false);
            setSearchQuery('');
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
            if (onSearchComplete) onSearchComplete();
        }
    };

    return (
        <div className="relative flex-shrink-0" ref={searchRef}>
            <div className="relative flex items-center w-40 lg:w-56 focus-within:w-72 h-9 px-3 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] focus-within:border-[var(--accent)] transition-all duration-300 shadow-inner">
                <Search size={15} className="text-[var(--text-muted)] shrink-0 mr-2" />
                <input 
                    type="text" 
                    name="search"
                    autoComplete="off"
                    spellCheck={false}
                    aria-label={t('search_placeholder')}
                    placeholder={t('search_placeholder')} 
                    value={searchQuery}
                    className="w-full bg-transparent text-xs font-semibold text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none"
                    onChange={(e) => handleSearchInput(e.target.value)}
                    onFocus={() => {
                        if (searchResults.length > 0) setShowDropdown(true);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSearchSubmit();
                        if (e.key === 'Escape') setShowDropdown(false);
                    }}
                />
                {searchQuery && (
                    <button
                        type="button"
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-white/5 hover:bg-white/10 shrink-0 ml-1 transition-colors"
                        onClick={() => { setSearchQuery(''); setSearchResults([]); setShowDropdown(false); }}
                        aria-label="Xoá nội dung tìm kiếm"
                    >
                        <X size={12} />
                    </button>
                )}
            </div>

            {showDropdown && (
                <div className="absolute right-0 top-12 w-80 max-h-96 overflow-y-auto rounded-2xl bg-[var(--glass-bg)] backdrop-blur-2xl border border-[var(--glass-border)] shadow-2xl p-2 z-50 animate-slide-up-fade">
                    {searching ? (
                        <div className="py-6 flex items-center justify-center gap-2 text-xs font-semibold text-[var(--text-secondary)]">
                            <div className="w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
                            <span>{t('searching')}</span>
                        </div>
                    ) : searchResults.length > 0 ? (
                        <div className="flex flex-col gap-1">
                            {searchResults.map(comic => (
                                <Link
                                    key={comic._id || comic.id}
                                    to={`/p/${slugify(comic.title)}-${comic._id || comic.id}`}
                                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--bg-secondary)] transition-colors group"
                                    onClick={() => { setShowDropdown(false); setSearchQuery(''); if (onSearchComplete) onSearchComplete(); }}
                                >
                                    <div className="w-10 h-14 rounded-lg overflow-hidden shrink-0 ring-1 ring-[var(--border)] bg-[var(--bg-card)]">
                                        <LazyImage
                                            src={comic.cover_url || comic.cover || ''}
                                            alt={comic.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <span className="block text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] truncate transition-colors">
                                            {comic.title}
                                        </span>
                                        <div className="flex items-center gap-2 mt-1">
                                            {(comic.rating && Number(comic.rating) > 0) ? (
                                                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400">
                                                    <Star size={10} fill="currentColor" />
                                                    {comic.rating}
                                                </span>
                                            ) : null}
                                            {comic.genres && comic.genres.length > 0 && (
                                                <span className="text-[10px] font-medium text-[var(--text-muted)] truncate">
                                                    {typeof comic.genres[0] === 'object' 
                                                        ? (comic.genres[0] as Genre).name 
                                                        : comic.genres[0]}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                            <div className="mt-1 pt-1 border-t border-[var(--border)]">
                                <button
                                    type="button"
                                    className="w-full py-2 text-center text-xs font-bold text-[var(--accent)] hover:opacity-80 transition-opacity"
                                    onClick={handleSearchSubmit}
                                >
                                    {t('view_all')} "{searchQuery}" →
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="py-6 text-center text-xs font-semibold text-[var(--text-muted)]">
                            {t('no_results')} "{searchQuery}"
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NavSearch;
