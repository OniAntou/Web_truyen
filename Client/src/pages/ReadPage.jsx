import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ReaderControls from '../components/Reader/ReaderControls';

const ReadPage = () => {
    const { id } = useParams();
    const [comic, setComic] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);

        // Fetch comic details (we need title mainly)
        fetch(`http://localhost:5000/api/comics/${id}`)
            .then(res => {
                if (!res.ok) throw new Error('Comic not found');
                return res.json();
            })
            .then(data => {
                setComic(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div style={{ paddingTop: '5rem', textAlign: 'center', color: 'white' }}>Loading...</div>;
    if (!comic) return <div style={{ paddingTop: '5rem', textAlign: 'center', color: 'white' }}>Comic not found</div>;

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
