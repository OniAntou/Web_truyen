import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import ComicGrid from '../components/Home/ComicGrid';

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');
    const [comics, setComics] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (query) {
            fetchSearchResults();
        } else {
            setComics([]);
            setLoading(false);
        }
    }, [query]);

    const fetchSearchResults = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/comics?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            setComics(data);
        } catch (error) {
            console.error('Error fetching search results:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <Navbar />
            <div style={{ paddingTop: '80px', minHeight: '60vh' }}>
                <div className="container">
                    <h2 className="section-title" style={{ marginTop: '2rem' }}>
                        Search Results for "{query}"
                    </h2>
                    
                    {loading ? (
                        <div style={{ color: 'white', textAlign: 'center', padding: '2rem' }}>Searching...</div>
                    ) : comics.length > 0 ? (
                        <ComicGrid title="" comics={comics} />
                    ) : (
                        <div style={{ color: 'gray', textAlign: 'center', padding: '4rem' }}>
                            No comics found matching your search.
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default SearchPage;
