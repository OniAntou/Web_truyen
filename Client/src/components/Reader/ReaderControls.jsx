import React from 'react';
import { Home, ArrowLeft, ArrowRight, List } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const ReaderControls = ({ comicId }) => {
    const navigate = useNavigate();
    return (
        <div className="reader-controls-fixed">
            <div className="reader-controls-bar">
                <button
                    className="control-btn"
                    title="Previous Chapter"
                >
                    <ArrowLeft size={24} />
                </button>

                <button
                    onClick={() => navigate(`/p/${comicId}`)}
                    className="control-btn"
                    title="Chapter List"
                >
                    <List size={24} />
                </button>

                <Link
                    to="/"
                    className="home-fab"
                    title="Home"
                >
                    <Home size={24} />
                </Link>

                <button className="control-btn" title="Settings">
                    <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Aa</span>
                </button>

                <button
                    className="control-btn"
                    title="Next Chapter"
                >
                    <ArrowRight size={24} />
                </button>
            </div>
        </div>
    );
};

export default ReaderControls;
