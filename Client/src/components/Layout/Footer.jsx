import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <h3 className="nav-logo">Comic<span>Verse</span></h3>
                        <p>
                            The premium destination for all your comic reading needs. High quality scans, latest releases, and a community of passionate readers.
                        </p>
                    </div>

                    <div className="footer-col">
                        <h4>Explore</h4>
                        <ul className="footer-links">
                            <li><Link to="/popular">Popular Comics</Link></li>
                            <li><Link to="/latest">Latest Updates</Link></li>
                            <li><Link to="/genres">Browse Genres</Link></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h4>Legal</h4>
                        <ul className="footer-links">
                            <li><Link to="/about">About Us</Link></li>
                            <li><Link to="/privacy">Privacy Policy</Link></li>
                            <li><Link to="/terms">Terms of Service</Link></li>
                            <li><a href="#">DMCA</a></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>© 2024 ComicVerse. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
