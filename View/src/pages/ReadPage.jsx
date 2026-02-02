import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ReaderControls from '../components/Reader/ReaderControls';
import { comics } from '../data/mockData';

const ReadPage = () => {
    const { id } = useParams();
    const comic = comics.find(c => c.id === parseInt(id));

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    if (!comic) return <div style={{ paddingTop: '5rem', textAlign: 'center' }}>Loading...</div>;

    return (
        <div className="reader-container">
            {/* Mock Pages */}
            {[1, 2, 3, 4, 5].map((page) => (
                <div key={page} style={{ marginBottom: '0.5rem' }}>
                    <img
                        src={`https://placehold.co/800x1200/1e1e1e/FFF?text=Page+${page}+of+${comic.title}`}
                        alt={`Page ${page}`}
                        className="reader-page-img"
                        loading="lazy"
                    />
                </div>
            ))}

            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <p>End of Chapter</p>
            </div>
            <ReaderControls comicId={id} />
        </div>
    );
};

export default ReadPage;
