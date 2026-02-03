import React, { useEffect, useState } from 'react';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import HeroSection from '../components/Home/HeroSection';
import ComicGrid from '../components/Home/ComicGrid';

const HomePage = () => {
    const [comics, setComics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [serverMessage, setServerMessage] = useState('');

    useEffect(() => {
        // Fetch comics
        fetch('http://localhost:5000/api/comics')
            .then(res => res.json())
            .then(data => {
                setComics(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch comics:', err);
                setLoading(false);
            });

        // Test connection
        fetch('http://localhost:5000/api/test')
            .then(res => res.json())
            .then(data => {
                console.log('Backend connected:', data);
                setServerMessage(data.message);
            })
            .catch(err => console.error('Failed to connect to server:', err));
    }, []);

    const featuredComic = comics[0] || {};
    const popularComics = comics;
    const newComics = [...comics].reverse();

    if (loading) {
        return <div style={{ paddingTop: '8rem', textAlign: 'center', color: 'white' }}>Loading comics...</div>;
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
            {serverMessage && (
                <div style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    background: '#22c55e',
                    color: 'white',
                    padding: '1rem',
                    borderRadius: '8px',
                    zIndex: 9999,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                    animation: 'fadeIn 0.5s ease-out'
                }}>
                    ✅ {serverMessage}
                </div>
            )}
            <Navbar />
            {comics.length > 0 && <HeroSection featuredComic={featuredComic} />}

            {/* Trending Section wrapper */}
            <div className="container trending-section">
                <div className="trending-panel">
                    <h3 className="section-title" style={{ border: 'none', padding: 0, marginBottom: '1rem', fontSize: '1.2rem' }}>
                        Trending Now
                    </h3>
                    <div className="trending-scroll">
                        {comics.map(c => (
                            <div key={c._id || c.id} className="trending-item">
                                <img src={c.cover_url || c.cover} className="trending-img" alt={c.title} />
                                <p style={{ fontWeight: 500, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {c.title}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <ComicGrid title="Popular Comics" comics={popularComics} />
            <ComicGrid title="New Releases" comics={newComics} />
            <Footer />
        </div>
    );
};

export default HomePage;
