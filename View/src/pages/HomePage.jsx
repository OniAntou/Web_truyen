import React from 'react';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import HeroSection from '../components/Home/HeroSection';
import ComicGrid from '../components/Home/ComicGrid';
import { comics } from '../data/mockData';

const HomePage = () => {
    const featuredComic = comics[0];
    const popularComics = comics;
    const newComics = comics.slice().reverse();

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <Navbar />
            <HeroSection featuredComic={featuredComic} />

            {/* Trending Section wrapper */}
            <div className="container trending-section">
                <div className="trending-panel">
                    <h3 className="section-title" style={{ border: 'none', padding: 0, marginBottom: '1rem', fontSize: '1.2rem' }}>
                        Trending Now
                    </h3>
                    <div className="trending-scroll">
                        {comics.map(c => (
                            <div key={c.id} className="trending-item">
                                <img src={c.cover} className="trending-img" alt={c.title} />
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
