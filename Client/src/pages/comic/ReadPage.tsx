import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import ReaderControls from '../../features/reader/ReaderControls';
import { Home, RotateCw } from 'lucide-react';
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
import ReaderErrorState from '../../features/reader/ReaderErrorState';

import { comicService } from '../../services/comicService';
import { chapterService } from '../../services/chapterService';
import { userService } from '../../services/userService';
import { saveReadingHistory } from '../../utils/readingHistory';
import { VIP_PRICE_PER_MONTH_XU, formatXu } from '../../constants/pricing';

import { useAuthStore } from '../../store/authStore';
import { extractComicId } from '../../utils/format';

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
    comic?: Partial<Comic>;
}

const ReadPage: React.FC = () => {
    const { slugAndId, chapterId } = useParams<{ slugAndId: string; chapterId: string }>();
    const comicId = extractComicId(slugAndId);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    
    const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({ isOpen: false, type: '', message: '', price: 0 });
    const [alertModal, setAlertModal] = useState<AlertModalState>({ isOpen: false, title: '', message: '', isSuccess: false });
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    
    const user = useAuthStore(state => state.user);
    const balance = typeof user?.balance === 'number'
        ? user.balance
        : typeof user?.coins === 'number' ? user.coins : null;

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [chapterId]);

    const { data, isLoading, error: queryError, refetch } = useQuery<ReaderData, Error | LockedError>({
        queryKey: ['readerData', comicId, chapterId],
        queryFn: () => comicService.getReaderData(comicId!, chapterId!),
        retry: false,
    });

    const comic = data?.comic ? { ...data.comic, chapters: data?.all_chapters } : null;
    const chapter = data?.chapter;
    const pages = chapter?.pages || [];

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
        }
    }, [chapter?._id, chapter?.pages?.length, user, comicId]);

    const lastSavedPageRef = useRef(1);

    // Phục hồi vị trí đọc cho đúng chapter này (không bao giờ lùi tiến độ).
    useEffect(() => {
        if (!user || !comicId || !chapter?._id) return;
        let cancelled = false;
        comicService.getReadingProgress(comicId)
            .then((progress) => {
                if (cancelled || !progress?.hasProgress || progress.chapter_id !== chapter._id) return;
                const targetPage = Math.max(1, progress.page_number || 1);
                lastSavedPageRef.current = targetPage;
                if (targetPage > 1) {
                    requestAnimationFrame(() => {
                        document.getElementById(`reader-page-${targetPage}`)?.scrollIntoView({ block: 'start' });
                    });
                }
            })
            .catch(() => {});
        return () => { cancelled = true; };
    }, [user, comicId, chapter?._id]);

    // Lưu tiến độ theo trang đang xem; chỉ lưu khi tiến về phía trước.
    useEffect(() => {
        const pageCount = pages.length;
        if (!user || !comicId || !chapter?._id || pageCount === 0) return;
        let raf = 0;
        const onScroll = () => {
            if (raf) return;
            raf = requestAnimationFrame(() => {
                raf = 0;
                let visiblePage = 1;
                for (let i = 1; i <= pageCount; i++) {
                    const el = document.getElementById(`reader-page-${i}`);
                    if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.5) visiblePage = i;
                    else break;
                }
                if (visiblePage > lastSavedPageRef.current && chapter._id) {
                    lastSavedPageRef.current = visiblePage;
                    comicService.updateReadingProgress(comicId, chapter._id, visiblePage).catch(() => {});
                }
            });
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', onScroll);
            if (raf) cancelAnimationFrame(raf);
        };
    }, [user, comicId, chapter?._id, pages.length]);

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
        const price = (error as LockedError)?.price || 0;
        if (balance !== null && balance < price) {
            setAlertModal({
                isOpen: true,
                title: 'Số dư không đủ',
                message: `Bạn cần ${formatXu(price)} Xu để mở khóa chapter này nhưng chỉ có ${formatXu(balance)} Xu.`,
                isSuccess: false,
                action: 'topup'
            });
            return;
        }
        setConfirmModal({
            isOpen: true,
            type: 'unlock',
            message: `Xác nhận dùng ${formatXu(price)} Xu để mở khóa chapter này?`,
            price
        });
    };

    const handleUpgradeVip = () => {
        if (!user) return navigate('/auth');
        if (balance !== null && balance < VIP_PRICE_PER_MONTH_XU) {
            setAlertModal({
                isOpen: true,
                title: 'Số dư không đủ',
                message: `Gói VIP 30 ngày giá ${formatXu(VIP_PRICE_PER_MONTH_XU)} Xu nhưng bạn chỉ có ${formatXu(balance)} Xu.`,
                isSuccess: false,
                action: 'topup'
            });
            return;
        }
        setConfirmModal({
            isOpen: true,
            type: 'vip',
            message: `Xác nhận dùng ${formatXu(VIP_PRICE_PER_MONTH_XU)} Xu để nâng cấp VIP 30 ngày?`,
            price: VIP_PRICE_PER_MONTH_XU
        });
    }

    const confirmAction = async () => {
        setIsProcessing(true);
        try {
            if (confirmModal.type === 'unlock') {
                await chapterService.unlockChapter(chapter?._id || chapterId!);
                setConfirmModal({ ...confirmModal, isOpen: false });
                setAlertModal({ isOpen: true, title: 'Thành công', message: 'Mở khóa chapter thành công!', isSuccess: true, action: 'close' });
                queryClient.invalidateQueries({ queryKey: ['readerData', comicId, chapterId] });
            } else if (confirmModal.type === 'vip') {
                await userService.upgradeVip();
                setConfirmModal({ ...confirmModal, isOpen: false });
                setAlertModal({ isOpen: true, title: 'Thành công', message: 'Nâng cấp VIP thành công! Chương đã được mở.', isSuccess: true, action: 'close' });
                queryClient.invalidateQueries({ queryKey: ['readerData', comicId, chapterId] });
            }
        } catch (err: unknown) {
            setConfirmModal({ ...confirmModal, isOpen: false });
            const message = err instanceof Error ? err.message : "Lỗi không xác định";
            setAlertModal({ isOpen: true, title: 'Giao dịch thất bại', message, isSuccess: false, action: 'close' });
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading) return <ReadPageSkeleton />;

    if (error && (error as LockedError).type === 'locked') {
        return (
            <div className="reader-page">
                <LockedChapterView
                    error={error as LockedError}
                    onUnlock={handleUnlock}
                    onUpgradeVip={handleUpgradeVip}
                />
                <Footer />

                <ReaderModals
                    confirmModal={confirmModal}
                    alertModal={alertModal}
                    isProcessing={isProcessing}
                    balance={balance}
                    onConfirm={confirmAction}
                    onCloseConfirm={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                    onCloseAlert={() => setAlertModal({ ...alertModal, isOpen: false })}
                    onNavigateTopup={() => navigate('/payment/topup')}
                />
            </div>
        );
    }

    if (error) {
        return (
            <div className="reader-page">
                <ReaderErrorState
                    title="Không tải được chương"
                    message={error instanceof Error ? error.message : (error as LockedError).message || 'Đã xảy ra lỗi khi tải dữ liệu.'}
                >
                    <button type="button" className="reader-action-btn reader-action-btn-primary" onClick={() => refetch()}>
                        <RotateCw size={16} /> Thử lại
                    </button>
                    <button type="button" className="reader-action-btn reader-action-btn-secondary" onClick={() => navigate('/')}>
                        <Home size={16} /> Về trang chủ
                    </button>
                </ReaderErrorState>
            </div>
        );
    }
    if (!comic || !chapter) {
        return (
            <div className="reader-page">
                <ReaderErrorState
                    title="Không tìm thấy nội dung"
                    message="Chapter hoặc truyện bạn tìm không tồn tại hoặc đã bị xoá."
                >
                    <button type="button" className="reader-action-btn reader-action-btn-primary" onClick={() => navigate('/')}>
                        <Home size={16} /> Về trang chủ
                    </button>
                </ReaderErrorState>
            </div>
        );
    }


    return (
        <div className="reader-page">
            <Helmet>
                <title>{comic.title} - {chapter.title} | Web Truyện</title>
                <meta name="description" content={`Đọc ${chapter.title} của truyện ${comic.title} bản quyền, chất lượng cao cực nhanh.`} />
                <link rel="canonical" href={window.location.href} />
                <meta property="og:title" content={`${comic.title} - ${chapter.title} | Web Truyện`} />
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
                            <div key={index} id={`reader-page-${index + 1}`}>
                                <LazyImage
                                    src={page.image_url}
                                    alt={`Trang ${index + 1}`}
                                    className="reader-page-img"
                                    aspectRatio={2 / 3}
                                    releaseAspectRatioOnLoad
                                />
                            </div>
                        ))
                    ) : (
                        <div className="py-16 text-center" style={{ color: 'var(--text-secondary)' }}>
                            <p>Chapter này chưa có trang nào.</p>
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
                balance={balance}
                onConfirm={confirmAction}
                onCloseConfirm={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onCloseAlert={() => setAlertModal({ ...alertModal, isOpen: false })}
                onNavigateTopup={() => navigate('/payment/topup')}
            />
        </div>
    );
};

export default ReadPage;
