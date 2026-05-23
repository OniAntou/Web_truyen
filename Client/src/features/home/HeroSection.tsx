import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Play, Eye, Star } from 'lucide-react';
import LazyImage from '../../components/ui/LazyImage';
import { translateStatus, slugify } from '../../utils/format';

import { Comic } from '../../types/comic';

interface HeroSectionProps {
    featuredComics: Comic[];
}

const HeroSection: React.FC<HeroSectionProps> = ({ featuredComics }) => {
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
    const frameRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent) => {
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
        <div className="hero-section-wrapper" id="hero-section">
            {/* Mobile Hero Layout */}
            <div className="mobile-hero lg:hidden">
                <div className="mobile-hero-bg">
                    <LazyImage 
                        src={currentComic.cover_url || currentComic.cover || ''} 
                        fill={true}
                        className="mobile-hero-bg-img object-cover" 
                        alt="" 
                    />
                    <div className="mobile-hero-gradient" />
                </div>
                
                <div className="mobile-hero-content" key={currentComic._id || currentComic.id}>
                    {/* Mobile Cover */}
                    <Link to={`/p/${slugify(currentComic.title)}-${currentComic.id || currentComic._id}`} className="mobile-hero-cover">
                        <LazyImage 
                            src={currentComic.cover_url || currentComic.cover || ''} 
                            fill={true}
                            className="mobile-hero-cover-img object-cover" 
                            alt={currentComic.title} 
                        />
                    </Link>
                    
                    <div className="mobile-hero-info">
                        <div className="mobile-hero-badge">Đề Xuất</div>
                        <h2 className="mobile-hero-title">{currentComic.title}</h2>
                        
                        <div className="mobile-hero-meta">
                            <span className="mobile-hero-meta-item">
                                <span className="mobile-hero-status-dot" style={{ background: currentComic.status === 'Ongoing' ? '#22c55e' : '#a8a29e' }} />
                                {translateStatus(currentComic.status || 'Ongoing')}
                            </span>
                            <span className="mobile-hero-meta-sep">•</span>
                            <span className="mobile-hero-meta-item mobile-hero-rating">
                                <Star size={12} fill="currentColor" /> {currentComic.rating || '5.0'}
                            </span>
                        </div>
                        
                        <Link 
                            to={`/p/${slugify(currentComic.title)}-${currentComic.id || currentComic._id}`} 
                            className="mobile-hero-cta"
                        >
                            <Play fill="currentColor" size={14} />
                            Đọc Ngay
                        </Link>
                    </div>
                </div>

                {/* Slideshow Indicators */}
                <div className="mobile-hero-dots">
                    {featuredComics.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`mobile-hero-dot ${idx === currentIndex ? 'active' : ''}`}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>
            </div>

            {/* Desktop Hero Layout */}
            <div className="relative w-full h-[85vh] min-h-[600px] items-center justify-center overflow-hidden pt-20 hidden lg:flex desktop-hero-wrapper">
                
                {/* Dynamic Blurred Background */}
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                    {featuredComics.map((comic, idx) => (
                        <div 
                            key={`bg-${comic._id || comic.id}`}
                            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentIndex ? 'opacity-100' : 'opacity-0'}`}
                        >
                            <img 
                                src={comic.cover_url || comic.cover || ''} 
                                className="w-full h-full object-cover blur-[80px] scale-125 saturate-[1.5] brightness-75" 
                                alt="" 
                            />
                            <div className="absolute inset-0 desktop-hero-overlay" />
                        </div>
                    ))}
                </div>

                <div className="container mx-auto px-6 max-w-7xl relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-24 items-center h-full">
                    {/* Text Content */}
                    <div className="space-y-8 relative" key={`content-${currentComic._id || currentComic.id}`}>
                        <div className="animate-slide-up-fade" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
                            <div className="inline-block px-4 py-1.5 rounded-full text-[0.65rem] font-bold tracking-widest uppercase border backdrop-blur-md transition-colors" style={{ background: 'var(--glass-bg)', color: 'var(--accent)', borderColor: 'var(--glass-border)' }}>
                                Truyện Đề Xuất
                            </div>
                        </div>
                        
                        <h1 className="text-5xl lg:text-7xl font-bold tracking-tighter leading-[1.1] line-clamp-2 animate-slide-up-fade drop-shadow-xl" style={{ color: 'var(--text-primary)', animationDelay: '0.2s', animationFillMode: 'both' }}>
                            {currentComic.title}
                        </h1>
                        
                        <p className="text-base lg:text-lg leading-relaxed line-clamp-3 max-w-lg animate-slide-up-fade" style={{ color: 'rgba(255, 255, 255, 0.8)', animationDelay: '0.3s', animationFillMode: 'both', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                            {currentComic.description || 'Hoà mình vào chặng đường phiêu lưu cực kỳ kỳ bí và hấp dẫn. Trải nghiệm cảm giác độc nhất vô nhị chỉ có tại nền tảng của chúng tôi.'}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold tracking-wider uppercase mb-8 animate-slide-up-fade" style={{ color: 'rgba(255, 255, 255, 0.8)', animationDelay: '0.4s', animationFillMode: 'both', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.8)]" style={{ background: currentComic.status === 'Ongoing' ? '#22c55e' : '#a8a29e' }}></span>
                                {translateStatus(currentComic.status || 'Ongoing')}
                            </span>
                            <span className="opacity-30">•</span>
                            <span>{currentComic.author || 'Đang cập nhật'}</span>
                            <span className="opacity-30">•</span>
                            <span className="flex items-center gap-1.5 text-yellow-400">
                                <Star size={14} fill="currentColor" /> {currentComic.rating || '5.0'}
                            </span>
                            <span className="opacity-30">•</span>
                            <span className="flex items-center gap-1.5" style={{ color: 'var(--accent)' }}>
                                <Eye size={14} /> {currentComic.weekly_views || 0}
                            </span>
                        </div>

                        <div className="flex items-center gap-4 mt-8 pt-2 animate-slide-up-fade" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
                            <Link to={`/p/${slugify(currentComic.title)}-${currentComic.id || currentComic._id}`} className="px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-[0_10px_30px_-10px_var(--accent)] text-xs tracking-widest uppercase border border-white/10" style={{ background: 'var(--accent)', color: 'white' }}>
                                <Play fill="currentColor" size={16} />
                                Đọc Ngay Bây Giờ
                            </Link>
                        </div>

                        {/* Slideshow Indicators */}
                        <div className="flex gap-2 mt-12 animate-slide-up-fade" style={{ animationDelay: '0.6s', animationFillMode: 'both' }}>
                            {featuredComics.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/30 hover:bg-white/60'}`}
                                    aria-label={`Go to slide ${idx + 1}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* 3D Cover */}
                    <div className="hidden lg:flex items-center justify-center relative perspective-1000 h-full w-full">
                        {/* Glow Behind Cover */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 rounded-full blur-[100px] bg-[var(--accent)] opacity-30 pointer-events-none transition-all duration-1000" />
                        
                        <div 
                            ref={frameRef} 
                            className="relative w-full max-w-[400px] aspect-[2/3] rounded-[2rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] ring-1 ring-white/20 transition-all bg-[var(--bg-secondary)]" 
                            onMouseMove={handleMouseMove} 
                            onMouseLeave={handleMouseLeave} 
                            onMouseEnter={handleMouseEnter}
                            style={{ transformStyle: 'preserve-3d' }}
                        >
                            <LazyImage src={currentComic.cover_url || currentComic.cover || ''} fill={true} className="object-cover" alt={currentComic.title} />
                            {/* Elegant reflection/shimmer overlay */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent mix-blend-overlay pointer-events-none rounded-[2rem]"></div>
                            <div className="absolute inset-0 ring-1 ring-inset ring-white/20 rounded-[2rem] pointer-events-none"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;
