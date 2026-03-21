import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import HeroSection from '../components/Home/HeroSection';
import ComicGrid from '../components/Home/ComicGrid';
import LazyImage from '../components/LazyImage';

const HomePage = () => {
    const [comics, setComics] = useState([]);
    const [trending, setTrending] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch all comics and trending comics concurrently
        Promise.all([
            fetch('http://localhost:5000/api/comics').then(res => res.json()),
            fetch('http://localhost:5000/api/comics/trending?limit=10').then(res => res.json())
        ])
        .then(([comicsData, trendingData]) => {
            setComics(Array.isArray(comicsData) ? comicsData : []);
            setTrending(Array.isArray(trendingData) ? trendingData : []);
            setLoading(false);
        })
        .catch(err => {
            console.error('Failed to fetch data:', err);
            setComics([]);
            setTrending([]);
            setLoading(false);
        });

        // Test connection (Console only)
        fetch('http://localhost:5000/api/test')
            .then(res => res.json())
            .then(data => console.log('Backend connected:', data))
            .catch(err => console.error('Failed to connect to server:', err));
    }, []);

    const featuredComics = trending.length > 0 ? trending.slice(0, 5) : comics.slice(0, 5);
    const popularComics = [...comics].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 12);
    const newComics = [...comics].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 12);

    if (loading) {
        return <div style={{ paddingTop: '8rem', textAlign: 'center', color: 'white' }}>Loading comics...</div>;
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <Navbar />
            {featuredComics.length > 0 && <HeroSection featuredComics={featuredComics} />}

            {/* Trending Section wrapper */}
            <div className="container trending-section">
                <div className="trending-panel">
                    <h3 className="section-title" style={{ border: 'none', padding: 0, marginBottom: '1rem', fontSize: '1.2rem' }}>
                        Trending Now
                    </h3>
                    <div className="trending-scroll">
                        {trending.slice(0, 7).map(c => (
                            <Link key={c._id || c.id} to={`/p/${c.id || c._id}`} className="trending-item">
                                <LazyImage src={c.cover_url || c.cover} className="trending-img" alt={c.title} />
                                <p style={{ fontWeight: 500, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {c.title}
                                </p>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <ComicGrid title="Popular Comics" comics={popularComics} linkTo="/popular" />
            <ComicGrid title="New Releases" comics={newComics} linkTo="/latest" />
            <Footer />
        </div>
    );
};

export default HomePage;
