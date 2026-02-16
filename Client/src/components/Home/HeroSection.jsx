import React from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';

const HeroSection = ({ featuredComic }) => {
    if (!featuredComic) return null;

    return (
        <div className="hero">
            {/* Content */}
            <div className="container hero-content">
                <div className="hero-layout">
                    <div className="hero-text-box">
                        <span className="featured-badge">Featured Comic</span>
                        <h1 className="hero-title">{featuredComic.title}</h1>
                        <p className="hero-desc">{featuredComic.description}</p>

                        <div className="hero-actions">
                            <Link
                                to={`/p/${featuredComic.id}`}
                                className="btn btn-primary"
                            >
                                <Play fill="currentColor" size={20} />
                                Read Now
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

                    {/* Cover Image on the right */}
                    <div className="hero-cover-wrapper">
                        <div className="hero-cover-frame">
                            <img
                                src={featuredComic.cover_url || featuredComic.cover}
                                alt={featuredComic.title}
                                className="hero-cover-img"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;
