import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, X, Star } from 'lucide-react';
import { comicService } from '../services/comicService';
import { Comic, Genre } from '../types/comic';
import { useTranslation } from '../hooks/useTranslation';
import LazyImage from '../components/ui/LazyImage';

interface NavSearchProps {
    onSearchComplete?: () => void;
}

const NavSearch: React.FC<NavSearchProps> = ({ onSearchComplete }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Comic[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [searching, setSearching] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
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
        <div className="nav-search-container flex-shrink-0" ref={searchRef}>
            <div className="nav-search-box">
                <Search size={18} className="nav-search-icon" />
                <input 
                    type="text" 
                    placeholder={t('search_placeholder')} 
                    value={searchQuery}
                    className="nav-search-input"
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
                        className="nav-search-clear"
                        onClick={() => { setSearchQuery(''); setSearchResults([]); setShowDropdown(false); }}
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            {showDropdown && (
                <div className="search-dropdown">
                    {searching ? (
                        <div className="search-dropdown-loading">
                            <div className="search-spinner"></div>
                            <span>{t('searching')}</span>
                        </div>
                    ) : searchResults.length > 0 ? (
                        <>
                            {searchResults.map(comic => (
                                <Link
                                    key={comic._id || comic.id}
                                    to={`/p/${comic._id || comic.id}`}
                                    className="search-dropdown-item"
                                    onClick={() => { setShowDropdown(false); setSearchQuery(''); if (onSearchComplete) onSearchComplete(); }}
                                >
                                    <LazyImage
                                        src={comic.cover_url || comic.cover || ''}
                                        alt={comic.title}
                                        className="search-dropdown-img"
                                        style={{ width: '40px', height: '56px', flexShrink: 0 }}
                                    />
                                    <div className="search-dropdown-info">
                                        <span className="search-dropdown-title">{comic.title}</span>
                                        <div className="search-dropdown-meta">
                                            {(comic.rating && Number(comic.rating) > 0) ? (
                                                <span className="search-dropdown-rating">
                                                    <Star size={10} fill="#eab308" color="#eab308" />
                                                    {comic.rating}
                                                </span>
                                            ) : null}
                                            {comic.genres && comic.genres.length > 0 && (
                                                <span className="search-dropdown-genre">
                                                    {typeof comic.genres[0] === 'object' 
                                                        ? (comic.genres[0] as Genre).name 
                                                        : comic.genres[0]}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                            <button
                                className="search-dropdown-viewall"
                                onClick={handleSearchSubmit}
                            >
                                {t('view_all')} "{searchQuery}"
                            </button>
                        </>
                    ) : (
                        <div className="search-dropdown-empty">
                            {t('no_results')} "{searchQuery}"
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NavSearch;
