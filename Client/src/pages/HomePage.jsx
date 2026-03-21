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
        return <div style={{ paddingTop: '8rem', textAlign: 'center', color: 'white' }}>Đang tải truyện...</div>;
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <Navbar />
            {featuredComics.length > 0 && <HeroSection featuredComics={featuredComics} />}

            {/* Trending Section wrapper */}
            <div className="container mx-auto px-6 py-8 md:py-12 max-w-7xl">
                <div className="rounded-[2rem] p-6 md:p-8 shadow-sm flex flex-col xl:flex-row gap-6 xl:items-center relative overflow-hidden" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                    {/* Background Glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl -z-0"></div>
                    
                    <div className="shrink-0 relative z-10 xl:w-32 xl:border-r border-[var(--border)] xl:pr-6 whitespace-nowrap">
                        <h3 className="text-xl md:text-2xl font-light tracking-tight leading-tight" style={{ color: 'var(--text-primary)' }}>
                            Top<br/><span className="font-bold whitespace-nowrap" style={{ color: 'var(--accent)' }}>Tuần</span>
                        </h3>
                    </div>
                    
                    <div className="flex-1 overflow-x-auto hide-scrollbar relative z-10">
                        <div className="flex gap-5 pb-2">
                            {trending.slice(0, 7).map(c => (
                                <Link key={c._id || c.id} to={`/p/${c.id || c._id}`} className="group shrink-0 w-28 md:w-36 flex flex-col gap-3">
                                    <div className="aspect-[2/3] w-full rounded-2xl overflow-hidden ring-1 ring-[var(--border)] relative bg-[var(--bg-primary)]">
                                        <LazyImage src={c.cover_url || c.cover} className="w-full h-full object-cover transition-transform duration-500 group-hover:-translate-y-1" alt={c.title} />
                                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300"></div>
                                    </div>
                                    <p className="font-semibold text-xs md:text-[0.9rem] line-clamp-1 transition-colors group-hover:text-[var(--accent)]" style={{ color: 'var(--text-primary)' }}>
                                        {c.title}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <ComicGrid title="Truyện Thịnh Hành" comics={popularComics} linkTo="/popular" />
            <ComicGrid title="Truyện Mới" comics={newComics} linkTo="/latest" />
            <Footer />
        </div>
    );
};

export default HomePage;
