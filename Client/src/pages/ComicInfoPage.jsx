import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import ComicInfo from '../components/Comic/ComicInfo';
import ChapterList from '../components/Comic/ChapterList';
import CommentSection from '../components/Comic/CommentSection';
import { comicService } from '../api/comicService';

const ComicInfoPage = () => {
    const { id } = useParams();
    const [comic, setComic] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);

        comicService.getById(id)
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
        return <div style={{ paddingTop: '8rem', textAlign: 'center' }}>Đang tải...</div>;
    }

    if (!comic) {
        return <div style={{ paddingTop: '8rem', textAlign: 'center' }}>Không tìm thấy truyện</div>;
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <Navbar />
            <div>
                <ComicInfo comic={comic} />
                <ChapterList chapters={comic.chapters} comicId={comic.id || comic._id} />
                <CommentSection comicId={comic.id || comic._id} />
            </div>
            <Footer />
        </div>
    );
};
export default ComicInfoPage;
