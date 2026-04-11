import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import ComicInfo from '../components/Comic/ComicInfo';
import ChapterList from '../components/Comic/ChapterList';
import CommentSection from '../components/Comic/CommentSection';
import { comicService } from '../api/comicService';
import ComicInfoSkeleton from '../components/Comic/ComicInfoSkeleton';

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
        return <ComicInfoSkeleton />;
    }

    if (!comic) {
        return <div style={{ paddingTop: '8rem', textAlign: 'center' }}>Không tìm thấy truyện</div>;
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <Helmet>
                <title>{comic.title} | Web Truyện</title>
                <meta name="description" content={comic.description?.substring(0, 160) || `Đọc truyện ${comic.title} bản quyền, chất lượng cao cực nhanh.`} />
                <meta property="og:title" content={`${comic.title} | Web Truyện`} />
                <meta property="og:description" content={comic.description?.substring(0, 160) || `Đọc truyện ${comic.title} bản quyền, chất lượng cao cực nhanh.`} />
                <meta property="og:image" content={comic.cover || comic.cover_url} />
                <meta property="og:type" content="book" />
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "ComicStory",
                        "name": comic.title,
                        "description": comic.description,
                        "image": comic.cover || comic.cover_url,
                        "author": {
                            "@type": "Person",
                            "name": comic.author || "Đang cập nhật"
                        }
                    })}
                </script>
            </Helmet>
            <Navbar />
            <main>
                <ComicInfo comic={comic} />
                <ChapterList chapters={comic.chapters} comicId={comic.id || comic._id} />
                <CommentSection comicId={comic.id || comic._id} />
            </main>
            <Footer />
        </div>
    );
};
export default ComicInfoPage;
