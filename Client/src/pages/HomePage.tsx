import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { AlertCircle } from 'lucide-react';
import HeroSection from '../features/home/HeroSection';
import ComicGrid from '../features/home/ComicGrid';
import { comicService } from '../services/comicService';
import HomePageSkeleton from '../features/home/HomePageSkeleton';

import { Comic } from '../types/comic';

interface HomeData {
    popular?: Comic[];
    latest?: Comic[];
    trending?: Comic[];
}

const HomePage: React.FC = () => {
    const homeVersion = localStorage.getItem('home_data_version') || '1';
    const { data, isLoading: loading, isError, refetch } = useQuery<HomeData>({
        queryKey: ['comics', 'home', homeVersion],
        queryFn: () => comicService.getHomeData(homeVersion)
    });
    
    const popularComics = data?.popular || [];
    const newComics = data?.latest || [];
    const trending = data?.trending || [];

    const featuredComics = trending.length > 0 ? trending.slice(0, 5) : popularComics.slice(0, 5);

    if (loading) {
        return <HomePageSkeleton />;
    }

    if (isError) {
        return (
            <div role="alert" className="flex flex-col items-center gap-3 px-4 text-center" style={{ minHeight: '70vh', justifyContent: 'center', paddingTop: '6rem', paddingBottom: '6rem', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                <AlertCircle size={44} style={{ color: 'var(--text-secondary)' }} aria-hidden="true" />
                <h2 className="text-xl font-bold">Không tải được trang chủ</h2>
                <p className="max-w-[26rem] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    Không nhận được dữ liệu từ máy chủ. Kiểm tra mạng rồi thử lại nhé.
                </p>
                <button type="button" className="reader-action-btn reader-action-btn-primary" style={{ marginTop: '1rem' }} onClick={() => refetch()}>
                    Thử lại
                </button>
            </div>
        );
    }

    if (featuredComics.length === 0 && popularComics.length === 0 && newComics.length === 0) {
        return (
            <div className="flex flex-col items-center gap-3 px-4 text-center" style={{ minHeight: '70vh', justifyContent: 'center', paddingTop: '6rem', paddingBottom: '6rem', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                <h2 className="text-xl font-bold">Chưa có truyện nào để hiển thị</h2>
                <p className="max-w-[26rem] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    Nội dung có thể đang được cập nhật. Thử tải lại sau ít phút nhé.
                </p>
                <button type="button" className="reader-action-btn reader-action-btn-secondary" style={{ marginTop: '1rem' }} onClick={() => refetch()}>
                    Tải lại
                </button>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <Helmet>
                <title>Web Truyện - Đọc truyện tranh online</title>
                <meta name="description" content="Đọc truyện tranh bản quyền, chất lượng cao cực nhanh, cập nhật liên tục mỗi ngày." />
                <link rel="canonical" href={window.location.origin} />
                <meta property="og:title" content="Web Truyện - Đọc truyện tranh online" />
                <meta property="og:description" content="Đọc truyện tranh bản quyền, chất lượng cao cực nhanh, cập nhật liên tục mỗi ngày." />
                <meta property="og:url" content={window.location.origin} />
                <meta property="og:type" content="website" />
            </Helmet>
            <h1 className="sr-only" style={{ display: 'none' }}>Web Truyện - Đọc truyện tranh online, truyện tranh bản quyền, cập nhật nhanh nhất</h1>
            {featuredComics.length > 0 && <HeroSection featuredComics={featuredComics} />}

            <ComicGrid title="Truyện Thịnh Hành" comics={popularComics} linkTo="/popular" />
            <ComicGrid title="Truyện Mới" comics={newComics} linkTo="/latest" />
        </div>
    );
};

export default HomePage;
