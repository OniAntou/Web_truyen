import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Play, Eye } from 'lucide-react';
import LazyImage from '../LazyImage';

const HeroSection = ({ featuredComics }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-advance slideshow
    useEffect(() => {
        if (!featuredComics || featuredComics.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % featuredComics.length);
        }, 5000); // 5 seconds

        return () => clearInterval(interval);
    }, [featuredComics]);

    if (!featuredComics || featuredComics.length === 0) return null;

    const currentComic = featuredComics[currentIndex];

    // 3D Tilt Effect Logic
    const frameRef = useRef(null);

    const handleMouseMove = (e) => {
        if (!frameRef.current) return;
        const rect = frameRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Tilt amount: max 12 degrees
        const rotateX = ((y - centerY) / centerY) * -12; 
        const rotateY = ((x - centerX) / centerX) * 12;

        frameRef.current.style.transform = `perspective(1000px) scale(1.05) translateY(-5px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };

    const handleMouseLeave = () => {
        if (!frameRef.current) return;
        frameRef.current.style.transform = `perspective(1000px) scale(1) translateY(0) rotateX(0deg) rotateY(0deg)`;
        frameRef.current.style.transition = 'all 0.5s ease-out';
    };

    const handleMouseEnter = () => {
        if (!frameRef.current) return;
        frameRef.current.style.transition = 'transform 0.1s ease-out'; // Fast track when entering
    };

    return (
        <div className="hero">
            {/* Content */}
            <div className="container hero-content">
                <div className="hero-layout">
                    <div className="hero-text-box">
                        <span className="featured-badge">Truyện Đề Xuất</span>
                        {/* Add fade-in animation key to force re-render animation when currentComic changes */}
                        <div key={currentComic._id || currentComic.id} className="animate-fade-in">
                            <h1 className="hero-title">{currentComic.title}</h1>
                            <p className="hero-desc">{currentComic.description}</p>

                            <div className="hero-actions">
                                <Link
                                    to={`/p/${currentComic.id || currentComic._id}`}
                                className="btn btn-primary"
                            >
                                <Play fill="currentColor" size={20} />
                                Đọc Ngay
                            </Link>
                        </div>

                            <div className="hero-meta">
                                <span style={{ display: 'flex', alignItems: 'center' }}>
                                    <span className="status-dot"></span>
                                    {currentComic.status}
                                </span>
                                <span>•</span>
                                <span>{currentComic.author}</span>
                                <span>•</span>
                                <span style={{ color: '#eab308' }}>★ {currentComic.rating}</span>
                                <span>•</span>
                                <span style={{ color: '#a855f7', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Eye size={16} /> {currentComic.weekly_views || 0}
                                </span>
                            </div>
                        </div>

                        {/* Slideshow Indicators */}
                        {featuredComics.length > 1 && (
                            <div className="hero-indicators flex gap-2 mt-6">
                                {featuredComics.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentIndex(idx)}
                                        className={`h-1.5 w-6 rounded-full transition-colors ${
                                            idx === currentIndex ? 'bg-purple-500' : 'bg-gray-600 hover:bg-gray-400'
                                        }`}
                                        aria-label={`Go to slide ${idx + 1}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Cover Image on the right */}
                    <div className="hero-cover-wrapper">
                        <Link 
                            to={`/p/${currentComic.id || currentComic._id}`} 
                            key={currentComic._id || currentComic.id} 
                            className="block animate-fade-in"
                        >
                            <div 
                                className="hero-cover-frame"
                                ref={frameRef}
                                onMouseMove={handleMouseMove}
                                onMouseEnter={handleMouseEnter}
                                onMouseLeave={handleMouseLeave}
                                style={{ transformStyle: 'preserve-3d' }}
                            >
                                <LazyImage
                                    src={currentComic.cover_url || currentComic.cover}
                                    alt={currentComic.title}
                                    className="hero-cover-img"
                                />
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;
