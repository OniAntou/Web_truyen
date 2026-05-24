import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';

import ComicGrid from '../features/home/ComicGrid';
import { comicService, ComicsResponse } from '../services/comicService';

const SearchPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [inputValue, setInputValue] = useState(query);
    const navigate = useNavigate();

    const { data, isLoading: loading } = useQuery<ComicsResponse>({
        queryKey: ['search', query],
        queryFn: () => comicService.getAll(query),
        enabled: !!query,
    });

    useEffect(() => {
        setInputValue(query);
    }, [query]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim()) {
            navigate(`/search?q=${encodeURIComponent(inputValue.trim())}`);
        }
    };

    const comics = data?.comics || [];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <div style={{ paddingTop: '80px', minHeight: '60vh' }}>
                <div className="container">
                    
                    {/* Search Input Area */}
                    <form onSubmit={handleSearch} className="relative mb-8 mt-4 max-w-2xl mx-auto">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Nhập tên truyện cần tìm..."
                            className="w-full bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border)] rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[var(--accent)] shadow-sm"
                            autoFocus={!query}
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={20} />
                        <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 bg-[var(--accent)] text-white px-4 py-2 rounded-xl text-sm font-bold">
                            Tìm
                        </button>
                    </form>

                    {query && (
                        <h2 className="section-title text-center mb-8">
                            Kết quả tìm kiếm cho "{query}"
                        </h2>
                    )}
                    
                    {loading ? (
                        <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>Đang tìm kiếm...</div>
                    ) : query && comics.length > 0 ? (
                        <ComicGrid title="" comics={comics} hideTitle={true} />
                    ) : query && comics.length === 0 ? (
                        <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '4rem' }}>
                            Không tìm thấy truyện nào phù hợp với "{query}".
                        </div>
                    ) : (
                        <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '4rem' }}>
                            Vui lòng nhập từ khóa để tìm kiếm truyện.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchPage;
