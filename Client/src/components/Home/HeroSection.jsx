import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Info } from 'lucide-react';

const HeroSection = ({ featuredComic }) => {
    if (!featuredComic) return null;

    return (
        <div className="hero">
            {/* Background Image */}
            <div
                className="hero-bg"
                style={{ backgroundImage: `url(${featuredComic.cover_url || featuredComic.cover})` }}
            >
                <div className="hero-overlay"></div>
                <div className="hero-gradient-side"></div>
            </div>

            {/* Content */}
            <div className="container hero-content">
                <div className="hero-text-box">
                    <span className="featured-badge">Featured Comic</span>
                    <h1 className="hero-title">{featuredComic.title}</h1>
                    <p className="hero-desc">{featuredComic.description}</p>

                    <div className="hero-actions">
                        <Link
                            to={`/read/${featuredComic.id}`}
                            className="btn btn-primary"
                        >
                            <Play fill="currentColor" size={20} />
                            Read Now
                        </Link>
                        <Link
                            to={`/p/${featuredComic.id}`}
                            className="btn btn-glass"
                        >
                            <Info size={20} />
                            More Info
                        </Link>
                    </div>

                    <div className="hero-meta">
                        <span style={{ display: 'flex', alignItems: 'center' }}>
                            <span className="status-dot"></span>
                            {featuredComic.status}
                        </span>
                        <span>•</span>
                        <span>{featuredComic.author}</span>
                        <span>•</span>
                        <span style={{ color: '#eab308' }}>★ {featuredComic.rating}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;
