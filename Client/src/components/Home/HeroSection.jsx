import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Play, Eye, Star } from 'lucide-react';
import LazyImage from '../ui/LazyImage';

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

        frameRef.current.style.transform = `perspective(1200px) scale(1.02) translateY(-5px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };

    const handleMouseLeave = () => {
        if (!frameRef.current) return;
        frameRef.current.style.transform = `perspective(1200px) scale(1) translateY(0) rotateX(0deg) rotateY(0deg)`;
        frameRef.current.style.transition = 'all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)';
    };

    const handleMouseEnter = () => {
        if (!frameRef.current) return;
        frameRef.current.style.transition = 'transform 0.1s ease-out'; // Fast track when entering
    };

    return (
        <div className="relative w-full h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden pt-20">

            <div className="container mx-auto px-6 max-w-7xl relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-24 items-center h-full">
                {/* Text Content */}
                <div className="space-y-8 animate-fade-in" key={currentComic._id || currentComic.id}>
                    <div className="inline-block px-4 py-1.5 rounded-full text-[0.65rem] font-bold tracking-widest uppercase border backdrop-blur-md transition-colors" style={{ background: 'var(--bg-secondary)', color: 'var(--accent)', borderColor: 'var(--accent)' }}>
                        Truyện Đề Xuất
                    </div>
                    
                    <h1 className="text-5xl lg:text-7xl font-light tracking-tighter leading-[1.1] line-clamp-2" style={{ color: 'var(--text-primary)' }}>
                        {currentComic.title}
                    </h1>
                    
                    <p className="text-base lg:text-lg leading-relaxed line-clamp-3 max-w-lg" style={{ color: 'var(--text-secondary)' }}>
                        {currentComic.description || 'Hoà mình vào chặng đường phiêu lưu cực kỳ kỳ bí và hấp dẫn. Trải nghiệm cảm giác độc nhất vô nhị chỉ có tại nền tảng của chúng tôi.'}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold tracking-wider uppercase mb-8" style={{ color: 'var(--text-secondary)' }}>
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ background: currentComic.status === 'Ongoing' ? '#22c55e' : '#a8a29e' }}></span>
                            {currentComic.status || 'Ongoing'}
                        </span>
                        <span className="opacity-30">•</span>
                        <span>{currentComic.author || 'Đang cập nhật'}</span>
                        <span className="opacity-30">•</span>
                        <span className="flex items-center gap-1.5 text-yellow-500">
                            <Star size={14} fill="currentColor" /> {currentComic.rating || '5.0'}
                        </span>
                        <span className="opacity-30">•</span>
                        <span className="flex items-center gap-1.5" style={{ color: 'var(--accent)' }}>
                            <Eye size={14} /> {currentComic.weekly_views || 0}
                        </span>
                    </div>

                    <div className="flex items-center gap-4 mt-8 pt-2">
                        <Link to={`/p/${currentComic.id || currentComic._id}`} className="px-8 py-4 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-transform hover:scale-105 active:scale-95 shadow-lg text-xs tracking-widest uppercase border border-white/10" style={{ background: 'var(--accent)', color: 'white' }}>
                            <Play fill="currentColor" size={16} />
                            Đọc Ngay Bây Giờ
                        </Link>
                    </div>

                    {/* Slideshow Indicators */}
                    <div className="flex gap-2 mt-12">
                        {featuredComics.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8' : 'w-2 opacity-30 hover:opacity-100'}`}
                                style={{ background: idx === currentIndex ? 'var(--accent)' : 'var(--text-primary)' }}
                                aria-label={`Go to slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                </div>

                {/* 3D Cover */}
                <div className="hidden lg:flex items-center justify-center relative perspective-1000 h-full w-full">
                    <div 
                        ref={frameRef} 
                        className="relative w-3/4 max-w-md aspect-[2/3] rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-[var(--border)] transition-all bg-[var(--bg-secondary)]" 
                        onMouseMove={handleMouseMove} 
                        onMouseLeave={handleMouseLeave} 
                        onMouseEnter={handleMouseEnter}
                        style={{ transformStyle: 'preserve-3d', boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.8)' }}
                    >
                        <LazyImage src={currentComic.cover_url || currentComic.cover} className="w-full h-full object-cover" alt={currentComic.title} />
                        {/* Elegant reflection/shimmer overlay */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent mix-blend-overlay pointer-events-none rounded-[2rem]"></div>
                        <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-[2rem] pointer-events-none"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;
