import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import ComicInfo from '../../features/comic/ComicInfo';
import ChapterList from '../../features/comic/ChapterList';
import CommentSection from '../../features/comic/CommentSection';
import { comicService } from '../../services/comicService';
import ComicInfoSkeleton from '../../features/comic/ComicInfoSkeleton';

const ComicInfoPage = () => {
    const { id } = useParams();
    
    const { data: comic, isLoading: loading } = useQuery({
        queryKey: ['comic', id],
        queryFn: () => comicService.getById(id!),
        enabled: !!id
    });

    React.useEffect(() => {
        window.scrollTo(0, 0);
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
            <ComicInfo comic={comic} />
            <ChapterList chapters={comic.chapters || []} comicId={comic.id || comic._id || ''} />
            <CommentSection comicId={comic.id || comic._id || ''} />
        </div>
    );
};
export default ComicInfoPage;
