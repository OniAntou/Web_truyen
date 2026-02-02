import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import ComicInfo, { ChapterList } from '../components/Comic/ComicInfo';
import { comics } from '../data/mockData';

const ComicInfoPage = () => {
    const { id } = useParams();
    const comic = comics.find(c => c.id === parseInt(id));

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    if (!comic) {
        return <div style={{ paddingTop: '8rem', textAlign: 'center' }}>Comic not found</div>;
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <Navbar />
            <div style={{ paddingTop: '5rem' }}>
                <ComicInfo comic={comic} />
                <ChapterList chapters={comic.chapters} comicId={comic.id} />
            </div>
            <Footer />
        </div>
    );
};

export default ComicInfoPage;
