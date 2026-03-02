import React from 'react';
import { Twitter, Facebook } from 'lucide-react';

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
                            <li><a href="#">Popular Comics</a></li>
                            <li><a href="#">Latest Updates</a></li>
                            <li><a href="#">New Arrivals</a></li>
                            <li><a href="#">Coming Soon</a></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h4>Legal</h4>
                        <ul className="footer-links">
                            <li><a href="#">Privacy Policy</a></li>
                            <li><a href="#">Terms of Service</a></li>
                            <li><a href="#">DMCA</a></li>
                            <li><a href="#">Contact Us</a></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>© 2024 ComicVerse. All rights reserved.</p>
                    <div className="social-links">
                        <a href="#"><Twitter size={20} /></a>
                        <a href="#"><Facebook size={20} /></a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
