import React, { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import HeroSection from '../components/Home/HeroSection';
import ComicGrid from '../components/Home/ComicGrid';
import LazyImage from '../components/ui/LazyImage';
import { comicService } from '../api/comicService';
import HomePageSkeleton from '../components/Home/HomePageSkeleton';

import { Comic } from '../types/comic';

interface HomeData {
    popular?: Comic[];
    latest?: Comic[];
    trending?: Comic[];
}

const HomePage: React.FC = () => {
    const homeVersion = localStorage.getItem('home_data_version') || '1';
    const { data, isLoading: loading } = useQuery<HomeData>({ 
        queryKey: ['comics', 'home', homeVersion], 
        queryFn: () => comicService.getHomeData(homeVersion) 
    });
    
    const popularComics = data?.popular || [];
    const newComics = data?.latest || [];
    const trending = data?.trending || [];


    useEffect(() => {
        // Test connection (Console only)
        comicService.testConnection()
            .then(data => console.log('Backend connected:', data))
            .catch(err => console.error('Failed to connect to server:', err));
    }, []);

    const featuredComics = trending.length > 0 ? trending.slice(0, 5) : popularComics.slice(0, 5);

    if (loading) {
        return <HomePageSkeleton />;
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <Helmet>
                <title>Web Truyện - Đọc truyện tranh online</title>
                <meta name="description" content="Đọc truyện tranh bản quyền, chất lượng cao cực nhanh, cập nhật liên tục mỗi ngày." />
                <meta property="og:title" content="Web Truyện - Đọc truyện tranh online" />
                <meta property="og:description" content="Đọc truyện tranh bản quyền, chất lượng cao cực nhanh, cập nhật liên tục mỗi ngày." />
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
