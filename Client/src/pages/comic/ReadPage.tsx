import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import Navbar from '../../layouts/Navbar';
import ReaderControls from '../../features/reader/ReaderControls';
import LazyImage from '../../components/ui/LazyImage';
import Footer from '../../layouts/Footer';
import CommentSection from '../../features/comic/CommentSection';
import ReadPageSkeleton from '../../components/ui/ReadPageSkeleton';
import ReportModal from '../../components/common/ReportModal';

// New extracted components
import LockedChapterView from '../../features/reader/LockedChapterView';
import ReaderModals, { ConfirmModalState, AlertModalState } from '../../features/reader/ReaderModals';
import ReaderHeader from '../../features/reader/ReaderHeader';
import ReaderFooterSection from '../../features/reader/ReaderFooterSection';

import { comicService } from '../../services/comicService';
import { chapterService } from '../../services/chapterService';
import { userService } from '../../services/userService';
import { saveReadingHistory } from '../../utils/readingHistory';

import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';

import { Comic, Chapter } from '../../types/comic';

interface ReaderPageChapter extends Chapter {
    pages?: { image_url: string }[];
    early_access_end_date?: string;
    price?: number;
    is_locked?: boolean;
}

interface ReaderData {
    comic: Comic;
    chapter: ReaderPageChapter;
    all_chapters: ReaderPageChapter[];
}

interface LockedError {
    is_locked: boolean;
    type: 'locked';
    message: string;
    price: number;
    early_access_end_date?: string;
    comic?: any;
}

const ReadPage: React.FC = () => {
    const { slugAndId, chapterId } = useParams<{ slugAndId: string; chapterId: string }>();
    const comicId = slugAndId?.includes('-') ? slugAndId.split('-').pop() : slugAndId;
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    
    const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({ isOpen: false, type: '', message: '', price: 0 });
    const [alertModal, setAlertModal] = useState<AlertModalState>({ isOpen: false, title: '', message: '', isSuccess: false });
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    
    const theme = useThemeStore(state => state.theme);
    const isDarkTheme = theme !== 'light';
    const user = useAuthStore(state => state.user);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [chapterId]);

    const { data, isLoading, error: queryError } = useQuery<ReaderData, Error | LockedError>({
        queryKey: ['readerData', comicId, chapterId],
        queryFn: () => comicService.getReaderData(comicId!, chapterId!),
        retry: false,
    });

    const comic = data?.comic ? { ...data.comic, chapters: data?.all_chapters } : null;
    const chapter = data?.chapter;

    const error = queryError && (queryError as LockedError).is_locked ? {
        type: 'locked',
        message: (queryError as LockedError).message,
        price: (queryError as LockedError).price,
        early_access_end_date: (queryError as LockedError).early_access_end_date,
        comic: (queryError as LockedError).comic
    } as LockedError : queryError;

    const viewedRef = React.useRef<string | null>(null);

    // Mark chapter as read
    useEffect(() => {
        if (user && comic && chapter && chapter.pages && chapter.pages.length > 0 && comicId) {
            saveReadingHistory({
                comicId: comicId,
                comicTitle: comic.title,
                coverUrl: comic.cover_url || comic.cover,
                chapterId: chapter._id || chapterId!,
                chapterTitle: chapter.title || '',
                chapterNumber: chapter.chapter_number
            });
            updateReadingProgress(1);
        }
    }, [chapter?._id, chapter?.pages?.length, user, comicId]);

    const updateReadingProgress = async (pageNum: number) => {
        if (!user || !comic || !chapter || !comicId || !chapter._id) return;
        try {
            await comicService.updateReadingProgress(comicId, chapter._id, pageNum);
        } catch (err) {
            console.error('Error updating reading progress:', err);
        }
    };

    // Track views
    useEffect(() => {
        if (user && comicId && viewedRef.current !== comicId) {
            viewedRef.current = comicId;
            comicService.updateView(comicId).catch(console.error);
        }
    }, [comicId, user]);

    const currentIndex = comic?.chapters?.findIndex(c => c._id === chapter?._id) ?? -1;
    const hasPrev = currentIndex > 0;
    const hasNext = !!(comic?.chapters && currentIndex < comic.chapters.length - 1);

    // PREFETCH NEXT CHAPTER
    useEffect(() => {
        if (hasNext && comicId && comic?.chapters) {
            const nextChapter = comic.chapters[currentIndex + 1];
            queryClient.prefetchQuery({
                queryKey: ['readerData', comicId, nextChapter._id],
                queryFn: () => comicService.getReaderData(comicId, nextChapter._id!)
            });
        }
    }, [hasNext, comicId, currentIndex, comic?.chapters, queryClient]);

    const handleNextChapter = () => {
        if (!comic || !chapter || !hasNext || !comicId || !comic.chapters) return;
        const nextChapter = comic.chapters[currentIndex + 1];
        navigate(`/read/${comicId}/${nextChapter._id}`);
    };

    const handlePrevChapter = () => {
        if (!comic || !chapter || !hasPrev || !comicId || !comic.chapters) return;
        const prevChapter = comic.chapters[currentIndex - 1];
        navigate(`/read/${comicId}/${prevChapter._id}`);
    };

    const handleUnlock = () => {
        if (!user) return navigate('/auth');
        setConfirmModal({ 
            isOpen: true, 
            type: 'unlock', 
            message: `Xác nhận dùng ${(error as LockedError)?.price || 0} Xu để mở khóa chapter này?`, 
            price: (error as LockedError)?.price || 0 
        });
    };

    const handleUpgradeVip = () => {
        if (!user) return navigate('/auth');
        setConfirmModal({ 
            isOpen: true, 
            type: 'vip', 
            message: 'Xác nhận dùng 50.000 Xu để nâng cấp VIP 30 ngày?', 
            price: 50000 
        });
    };

    const confirmAction = async () => {
        setIsProcessing(true);
        try {
            if (confirmModal.type === 'unlock') {
                await chapterService.unlockChapter(chapter?._id || chapterId!);
                setConfirmModal({ ...confirmModal, isOpen: false });
                setAlertModal({ isOpen: true, title: 'Thành công', message: 'Mở khóa chapter thành công!', isSuccess: true });
                queryClient.invalidateQueries({ queryKey: ['readerData', comicId, chapterId] });
            } else if (confirmModal.type === 'vip') {
                await userService.upgradeVip();
                setConfirmModal({ ...confirmModal, isOpen: false });
                setAlertModal({ isOpen: true, title: 'Thành công', message: 'Nâng cấp VIP thành công! Hệ thống sẽ tự động tải lại trang.', isSuccess: true });
                queryClient.invalidateQueries({ queryKey: ['readerData', comicId, chapterId] });
            }
        } catch (err: unknown) {
            setConfirmModal({ ...confirmModal, isOpen: false });
            const message = err instanceof Error ? err.message : "Lỗi không xác định";
            setAlertModal({ isOpen: true, title: 'Giao dịch thất bại', message, isSuccess: false });
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading) return <ReadPageSkeleton />;

    if (error && (error as LockedError).type === 'locked') {
        return (
            <div className="reader-page">
                <Navbar />
                <LockedChapterView 
                    error={error as LockedError}
                    isDarkTheme={isDarkTheme}
                    onUnlock={handleUnlock}
                    onUpgradeVip={handleUpgradeVip}
                />
                <Footer />

                <ReaderModals 
                    confirmModal={confirmModal}
                    alertModal={alertModal}
                    isProcessing={isProcessing}
                    onConfirm={confirmAction}
                    onCloseConfirm={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                    onCloseAlert={() => setAlertModal({ ...alertModal, isOpen: false })}
                    onNavigateTopup={() => navigate('/payment/topup')}
                />
            </div>
        );
    }

    if (error) return <div style={{ paddingTop: '5rem', textAlign: 'center', color: 'red' }}>Error: {error instanceof Error ? error.message : (error as LockedError).message || 'Unknown error'}</div>;
    if (!comic || !chapter) return <div style={{ paddingTop: '5rem', textAlign: 'center', color: 'white' }}>Content not found</div>;

    const pages = chapter.pages || [];

    return (
        <div className="reader-page">
            <Helmet>
                <title>{comic.title} - {chapter.title} | Web Truyện</title>
                <meta name="description" content={`Đọc ${chapter.title} của truyện ${comic.title} bản quyền, chất lượng cao cực nhanh.`} />
                <link rel="canonical" href={window.location.href} />
                <meta property="og:title" content={`${comic.title} - {chapter.title} | Web Truyện`} />
                <meta property="og:description" content={`Đọc ${chapter.title} của truyện ${comic.title} bản quyền, chất lượng cao cực nhanh.`} />
                <meta property="og:image" content={comic.cover || comic.cover_url} />
                <meta property="og:url" content={window.location.href} />
                <meta property="og:type" content="article" />
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "BreadcrumbList",
                        "itemListElement": [
                            {
                                "@type": "ListItem",
                                "position": 1,
                                "name": "Trang chủ",
                                "item": window.location.origin
                            },
                            {
                                "@type": "ListItem",
                                "position": 2,
                                "name": comic.title,
                                "item": `${window.location.origin}/p/${comicId}`
                            },
                            {
                                "@type": "ListItem",
                                "position": 3,
                                "name": chapter.title,
                                "item": window.location.href
                            }
                        ]
                    })}
                </script>
            </Helmet>
            <Navbar />
            <main>
                <ReaderHeader 
                    comicId={comicId!}
                    comicTitle={comic.title}
                    chapterTitle={chapter.title || ''}
                    onOpenReport={() => setReportModalOpen(true)}
                />

                <div className="reader-container reader-container-spacing">
                    {pages.length > 0 ? (
                        pages.map((page, index) => (
                            <LazyImage
                                key={index}
                                src={page.image_url}
                                alt={`Page ${index + 1}`}
                                className="reader-page-img"
                                aspectRatio={2 / 3}
                                releaseAspectRatioOnLoad
                            />
                        ))
                    ) : (
                        <div style={{ padding: '4rem', textAlign: 'center', color: 'gray' }}>
                            <p>No images in this chapter.</p>
                        </div>
                    )}

                    <ReaderControls 
                        comicId={comicId!} 
                        comicTitle={comic.title}
                        chapters={comic?.chapters || []}
                        currentChapterId={chapter?._id as string}
                        onPrev={handlePrevChapter} 
                        onNext={handleNextChapter} 
                    />
                </div>
            
                <ReaderFooterSection 
                    comicId={comicId!}
                    comicTitle={comic.title}
                    hasPrev={hasPrev}
                    hasNext={hasNext}
                    onPrev={handlePrevChapter}
                    onNext={handleNextChapter}
                />

                <CommentSection comicId={comicId!} chapterId={chapter._id || chapterId!} />

                <ReportModal 
                    isOpen={reportModalOpen}
                    onClose={() => setReportModalOpen(false)}
                    targetType="chapter"
                    targetId={chapter._id || chapterId!}
                />
            </main>
            <Footer />
            
            <ReaderModals 
                confirmModal={confirmModal}
                alertModal={alertModal}
                isProcessing={isProcessing}
                onConfirm={confirmAction}
                onCloseConfirm={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onCloseAlert={() => setAlertModal({ ...alertModal, isOpen: false })}
                onNavigateTopup={() => navigate('/payment/topup')}
            />
        </div>
    );
};

export default ReadPage;
