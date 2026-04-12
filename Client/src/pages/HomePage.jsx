import React, { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import HeroSection from '../components/Home/HeroSection';
import ComicGrid from '../components/Home/ComicGrid';
import LazyImage from '../components/ui/LazyImage';
import { comicService } from '../api/comicService';
import HomePageSkeleton from '../components/Home/HomePageSkeleton';

const HomePage = () => {
    const { data, isLoading: loading } = useQuery({ 
        queryKey: ['comics', 'home'], 
        queryFn: () => comicService.getHomeData() 
    });
    
    const popularComics = data?.popular || [];
    const newComics = data?.latest || [];
    const trending = data?.trending || [];

    // Scroll ref for navigation
    const scrollRef = useRef(null);

    const scroll = (direction) => {
        if (!scrollRef.current) return;
        
        const scrollAmount = 400;
        const targetScroll = direction === 'left' 
            ? scrollRef.current.scrollLeft - scrollAmount 
            : scrollRef.current.scrollLeft + scrollAmount;
            
        scrollRef.current.scrollTo({ 
            left: targetScroll, 
            behavior: 'smooth' 
        });
    };

    useEffect(() => {
        // Test connection (Console only)
        comicService.testConnection()
            .then(data => console.log('Backend connected:', data))
            .catch(err => console.error('Failed to connect to server:', err));
    }, []);

    const featuredComics = trending.length > 0 ? trending.slice(0, 5) : popularComics.slice(0, 5);

    if (loading) {
        return <HomePageSkeleton />;
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <Helmet>
                <title>Web Truyện - Đọc truyện tranh online</title>
                <meta name="description" content="Đọc truyện tranh bản quyền, chất lượng cao cực nhanh, cập nhật liên tục mỗi ngày." />
                <meta property="og:title" content="Web Truyện - Đọc truyện tranh online" />
                <meta property="og:description" content="Đọc truyện tranh bản quyền, chất lượng cao cực nhanh, cập nhật liên tục mỗi ngày." />
                <meta property="og:type" content="website" />
            </Helmet>
            <Navbar />
            <main>
                <h1 className="sr-only" style={{ display: 'none' }}>Web Truyện - Đọc truyện tranh online, truyện tranh bản quyền, cập nhật nhanh nhất</h1>
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
                    
                    <div className="flex-1 relative overflow-hidden group/nav">
                        <div 
                            ref={scrollRef}
                            className="w-full overflow-x-auto hide-scrollbar relative z-10"
                            style={{ scrollBehavior: 'smooth' }}
                        >
                            <div className="flex gap-5 pb-2">
                                {trending.slice(0, 7).map(c => (
                                    <Link key={c._id || c.id} to={`/p/${c.id || c._id}`} className="group shrink-0 w-28 md:w-36 flex flex-col gap-3">
                                        <div className="aspect-[2/3] w-full rounded-2xl overflow-hidden ring-1 ring-[var(--border)] relative bg-[var(--bg-primary)]">
                                            <LazyImage src={c.cover_url || c.cover} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt={c.title} />
                                            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300"></div>
                                        </div>
                                        <p className="font-semibold text-xs md:text-[0.9rem] line-clamp-1 transition-colors group-hover:text-[var(--accent)]" style={{ color: 'var(--text-primary)' }}>
                                            {c.title}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Navigation Buttons */}
                        <button 
                            onClick={() => scroll('left')} 
                            className="absolute left-2 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/80 text-white backdrop-blur-md border border-white/20 opacity-100 md:opacity-0 md:group-hover/nav:opacity-100 transition-all hover:bg-[var(--accent)] hover:scale-110 cursor-pointer flex items-center justify-center shadow-2xl"
                            aria-label="Scroll Left"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button 
                            onClick={() => scroll('right')} 
                            className="absolute right-2 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/80 text-white backdrop-blur-md border border-white/20 opacity-100 md:opacity-0 md:group-hover/nav:opacity-100 transition-all hover:bg-[var(--accent)] hover:scale-110 cursor-pointer flex items-center justify-center shadow-2xl"
                            aria-label="Scroll Right"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>
                </div>
            </div>

            <ComicGrid title="Truyện Thịnh Hành" comics={popularComics} linkTo="/popular" />
            <ComicGrid title="Truyện Mới" comics={newComics} linkTo="/latest" />
            </main>
            <Footer />
        </div>
    );
};

export default HomePage;
