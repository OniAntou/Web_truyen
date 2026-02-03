import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import ComicInfo, { ChapterList } from '../components/Comic/ComicInfo';

const ComicInfoPage = () => {
    const { id } = useParams();
    const [comic, setComic] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);

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

    if (loading) {
        return <div style={{ paddingTop: '8rem', textAlign: 'center' }}>Loading...</div>;
    }

    if (!comic) {
        return <div style={{ paddingTop: '8rem', textAlign: 'center' }}>Comic not found</div>;
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <Navbar />
            <div style={{ paddingTop: '5rem' }}>
                <ComicInfo comic={comic} />
                <ChapterList chapters={comic.chapters} comicId={comic.id || comic._id} />
            </div>
            <Footer />
        </div>
    );
};
export default ComicInfoPage;
