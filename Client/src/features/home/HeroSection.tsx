import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Play, Eye, Star } from 'lucide-react';
import LazyImage from '../../components/ui/LazyImage';
import { translateStatus, slugify } from '../../utils/format';

import { Comic } from '../../types/comic';

interface HeroSectionProps {
    featuredComics: Comic[];
}

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
        if (!frameRef.current || prefersReducedMotion()) return;
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
        if (!frameRef.current || prefersReducedMotion()) return;
        frameRef.current.style.transform = `perspective(1200px) scale(1) translateY(0) rotateX(0deg) rotateY(0deg)`;
        frameRef.current.style.transition = 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)';
    };

    const handleMouseEnter = () => {
        if (!frameRef.current || prefersReducedMotion()) return;
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
                    <Link
                        to={`/p/${slugify(currentComic.title)}-${currentComic.id || currentComic._id}`}
                        className="mobile-hero-cover"
                        aria-label={`Xem thông tin truyện ${currentComic.title}`}
                    >
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
            <div className="relative w-full h-[85vh] min-h-[640px] items-center justify-center overflow-hidden pt-20 hidden lg:flex desktop-hero-wrapper">
                
                {/* Dynamic Blurred Background */}
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                    {featuredComics.map((comic, idx) => (
                        <div 
                            key={`bg-${comic._id || comic.id}`}
                            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentIndex ? 'opacity-100' : 'opacity-0'}`}
                        >
                            <img 
                                src={comic.cover_url || comic.cover || ''} 
                                className="w-full h-full object-cover blur-[90px] scale-125 saturate-150 opacity-40 dark:opacity-30" 
                                alt="" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-primary)]/40 via-transparent to-[var(--bg-primary)]" />
                        </div>
                    ))}
                </div>

                <div className="container mx-auto px-6 max-w-7xl relative z-10 grid lg:grid-cols-12 gap-12 items-center h-full">
                    {/* Left: Text Content (col-span-7) */}
                    <div className="lg:col-span-7 space-y-7 relative" key={`content-${currentComic._id || currentComic.id}`}>
                        <div className="animate-slide-up-fade">
                            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] font-extrabold tracking-[0.2em] uppercase bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 shadow-sm backdrop-blur-md">
                                ★ Đề Xuất Tuần Này
                            </span>
                        </div>
                        
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-[var(--text-primary)] animate-slide-up-fade line-clamp-2">
                            {currentComic.title}
                        </h1>
                        
                        <p className="text-sm sm:text-base leading-relaxed text-[var(--text-secondary)] line-clamp-3 max-w-xl animate-slide-up-fade">
                            {currentComic.description || 'Hoà mình vào chặng đường phiêu lưu kỳ bí và hấp dẫn. Trải nghiệm đọc mượt mà và độc quyền tại ComicVerse.'}
                        </p>

                        <div className="flex flex-wrap items-center gap-3.5 text-xs font-semibold tracking-wider uppercase animate-slide-up-fade text-[var(--text-secondary)]">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]">
                                <span className="w-2 h-2 rounded-full" style={{ background: currentComic.status === 'Ongoing' ? '#22c55e' : '#a8a29e' }}></span>
                                {translateStatus(currentComic.status || 'Ongoing')}
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]">
                                <span className="text-[var(--text-muted)]">Tác giả:</span> {currentComic.author || 'Đang cập nhật'}
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                                <Star size={13} fill="currentColor" /> {currentComic.rating || '5.0'}
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 font-bold">
                                <Eye size={13} /> {currentComic.weekly_views || 0}
                            </span>
                        </div>

                        {/* CTA Button-in-Button */}
                        <div className="flex items-center gap-4 pt-2 animate-slide-up-fade">
                            <Link 
                                to={`/p/${slugify(currentComic.title)}-${currentComic.id || currentComic._id}`} 
                                className="group inline-flex items-center gap-3 pl-6 pr-2 py-2 rounded-full font-bold text-xs uppercase tracking-widest text-white bg-[var(--accent)] shadow-xl shadow-[var(--accent)]/25 hover:shadow-[var(--accent)]/40 hover:scale-105 active:scale-95 transition-all duration-300"
                            >
                                <span>Đọc Ngay Bây Giờ</span>
                                <span className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform duration-300">
                                    <Play fill="currentColor" size={14} />
                                </span>
                            </Link>
                        </div>

                        {/* Slideshow Progress Indicators */}
                        <div className="flex gap-2 pt-4 animate-slide-up-fade">
                            {featuredComics.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={`h-1.5 rounded-full transition-all duration-500 ${
                                        idx === currentIndex 
                                            ? 'w-10 bg-[var(--accent)] shadow-sm shadow-[var(--accent)]/40' 
                                            : 'w-2 bg-[var(--text-muted)] opacity-30 hover:opacity-80'
                                    }`}
                                    aria-label={`Go to slide ${idx + 1}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Right: 3D Double-Bezel Cover (col-span-5) */}
                    <div className="lg:col-span-5 flex items-center justify-center relative perspective-1000 h-full w-full">
                        <div 
                            ref={frameRef} 
                            className="relative w-full max-w-[360px] p-2.5 rounded-[2.5rem] bg-gradient-to-b from-white/15 to-white/5 border border-[var(--border)] shadow-2xl backdrop-blur-md transition-all duration-300" 
                            onMouseMove={handleMouseMove} 
                            onMouseLeave={handleMouseLeave} 
                            onMouseEnter={handleMouseEnter}
                            style={{ transformStyle: 'preserve-3d' }}
                        >
                            <div className="relative w-full aspect-[2/3] rounded-[calc(2.5rem-0.625rem)] overflow-hidden bg-[var(--bg-secondary)] shadow-inner">
                                <LazyImage 
                                    src={currentComic.cover_url || currentComic.cover || ''} 
                                    fill={true} 
                                    className="object-cover" 
                                    alt={currentComic.title} 
                                />
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;
