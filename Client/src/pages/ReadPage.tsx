import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight, ChevronLeft, BookOpen, Lock, X, AlertCircle, CheckCircle } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import Navbar from '../components/Layout/Navbar';
import ReaderControls from '../components/Reader/ReaderControls';
import LazyImage from '../components/ui/LazyImage';
import Footer from '../components/Layout/Footer';
import CommentSection from '../components/Comic/CommentSection';
import ReadPageSkeleton from '../components/ui/ReadPageSkeleton';

import { comicService } from '../api/comicService';
import { chapterService } from '../api/chapterService';
import { userService } from '../api/userService';
import { saveReadingHistory } from '../utils/readingHistory';
import ReportModal from '../components/common/ReportModal';
import { Flag } from 'lucide-react';

import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';

import { Comic, Chapter } from '../types/comic';

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

interface ConfirmModalState {
    isOpen: boolean;
    type: 'unlock' | 'vip' | '';
    message: string;
    price: number;
}

interface AlertModalState {
    isOpen: boolean;
    title: string;
    message: string;
    isSuccess: boolean;
}

const ReadPage: React.FC = () => {
    const { comicId, chapterId } = useParams<{ comicId: string; chapterId: string }>();
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
    const hasNext = comic?.chapters && currentIndex < comic.chapters.length - 1;

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
        const lockedError = error as LockedError;
        return (
            <div className="reader-page">
                <Navbar />
                <div style={{ 
                    paddingTop: '8rem', 
                    textAlign: 'center', 
                    color: isDarkTheme ? 'white' : 'var(--text-primary)', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    minHeight: '60vh' 
                }}>
                    <div className={`${isDarkTheme ? 'bg-zinc-900/50 border-white/10' : 'bg-white border-zinc-200'} p-8 rounded-3xl border backdrop-blur-md max-w-md w-full shadow-xl`}>
                        <Lock size={48} className="mx-auto text-yellow-500 mb-4" />
                        
                        {(lockedError.early_access_end_date || chapter?.early_access_end_date) && new Date(lockedError.early_access_end_date || chapter?.early_access_end_date || '').getTime() > new Date().getTime() && (
                            <div className="mb-4">
                                <span className="bg-yellow-500/10 text-yellow-500 px-4 py-1.5 rounded-full text-[0.7rem] uppercase tracking-widest font-bold border border-yellow-500/20 inline-block shadow-sm">
                                    Mở miễn phí vào {new Date(lockedError.early_access_end_date || chapter?.early_access_end_date || '').toLocaleDateString('vi-VN')}
                                </span>
                            </div>
                        )}
                        
                        <h2 className="text-xl font-bold mb-2">Chapter Yêu Cầu Trả Phí</h2>
                        <p className={`${isDarkTheme ? 'text-zinc-400' : 'text-zinc-500'} text-sm mb-6 leading-relaxed`}>
                            Bạn cần dùng Xu để đọc trước chapter này. <br/>
                            Hoặc đăng ký tài khoản VIP để đọc toàn bộ truyện miễn phí!
                        </p>
                        
                        <div className="space-y-3 w-full max-w-[300px] mx-auto">
                            <button 
                                onClick={handleUnlock}
                                className={`w-full ${isDarkTheme ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-zinc-100 hover:bg-zinc-200'} border border-white/5 text-${isDarkTheme ? 'white' : 'black'} font-semibold py-3 px-6 rounded-2xl transition-colors flex items-center justify-center gap-2 text-sm`}
                            >
                                <Lock size={16} className="text-yellow-500" />
                                Mở khóa ({lockedError.price} Xu)
                            </button>
                            <button 
                                onClick={handleUpgradeVip}
                                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-black hover:brightness-110 font-bold py-3 px-6 rounded-2xl transition-all shadow-[0_0_20px_rgba(234,179,8,0.15)] text-sm"
                            >
                                Đăng ký VIP (50.000 Xu / Tháng)
                            </button>
                        </div>
                    </div>
                </div>
                <Footer />

                {/* Confirm Modal */}
                {confirmModal.isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <div className="bg-zinc-950 border border-white/10 p-8 rounded-[2rem] max-w-sm w-full shadow-2xl relative text-center">
                            <button 
                                onClick={() => !isProcessing && setConfirmModal({ ...confirmModal, isOpen: false })}
                                className="absolute right-6 top-6 text-zinc-500 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                            <div className="mx-auto w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mb-6">
                                <Lock size={28} className="text-yellow-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Xác nhận thanh toán</h3>
                            <p className="text-zinc-400 text-sm mb-8 leading-relaxed">{confirmModal.message}</p>
                            
                            <div className="bg-black/40 rounded-xl p-4 mb-8 flex justify-between items-center border border-white/5">
                                <span className="text-zinc-400 text-sm font-medium">Tổng thanh toán:</span>
                                <span className="text-yellow-500 font-bold text-lg">{confirmModal.price} Xu</span>
                            </div>

                            <button 
                                onClick={confirmAction}
                                disabled={isProcessing}
                                className={`w-full font-bold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 ${
                                    isProcessing 
                                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                                    : 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-[0_0_15px_rgba(234,179,8,0.3)]'
                                }`}
                            >
                                {isProcessing ? 'Đang xử lý...' : 'Xác Nhận & Mở Khóa'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Alert/Result Modal */}
                {alertModal.isOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in zoom-in-95 duration-200">
                        <div className="bg-zinc-950 border border-white/10 p-8 rounded-[2rem] max-w-sm w-full shadow-2xl relative text-center">
                            <button 
                                onClick={() => setAlertModal({ ...alertModal, isOpen: false })}
                                className="absolute right-6 top-6 text-zinc-500 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                            <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 border-4 ${alertModal.isSuccess ? 'border-green-500/20 bg-green-500/10' : 'border-red-500/20 bg-red-500/10'}`}>
                                {alertModal.isSuccess ? (
                                    <CheckCircle size={36} className="text-green-500" />
                                ) : (
                                    <AlertCircle size={36} className="text-red-500" />
                                )}
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">{alertModal.title}</h3>
                            <p className="text-zinc-400 text-sm mb-8 leading-relaxed">{alertModal.message}</p>
                            
                            <button 
                                onClick={() => {
                                    setAlertModal({ ...alertModal, isOpen: false });
                                    if(!alertModal.isSuccess && alertModal.message.includes("không đủ")) {
                                        navigate('/payment/topup');
                                    }
                                }}
                                className={`w-full font-bold py-3.5 px-6 rounded-xl transition-all ${
                                    alertModal.isSuccess 
                                    ? 'bg-white hover:bg-zinc-200 text-black' 
                                    : 'bg-red-500 hover:bg-red-400 text-white'
                                }`}
                            >
                                {alertModal.isSuccess ? 'Đang tải lại...' : (alertModal.message.includes("không đủ") ? 'Nạp Xu Ngay' : 'Đóng')}
                            </button>
                        </div>
                    </div>
                )}
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
                <meta property="og:title" content={`${comic.title} - ${chapter.title} | Web Truyện`} />
                <meta property="og:description" content={`Đọc ${chapter.title} của truyện ${comic.title} bản quyền, chất lượng cao cực nhanh.`} />
                <meta property="og:image" content={comic.cover || comic.cover_url} />
                <meta property="og:type" content="article" />
            </Helmet>
            <Navbar />
            <main>

            {/* Reader Info Bar */}
            <div className="reader-info-bar">
                <div className="reader-info-content">
                    <Link to={`/p/${comicId}`} className="reader-info-back" title={comic?.title}>
                        <ArrowLeft size={16} />
                        <span className="reader-info-back-title">{comic?.title}</span>
                    </Link>

                    {chapter.title && (
                        <span className="reader-info-center-chapter">
                            {chapter.title}
                        </span>
                    )}

                    {chapter.title && <div className="reader-info-spacer"></div>}

                    <button 
                        onClick={() => setReportModalOpen(true)}
                        className="flex items-center gap-2 text-zinc-500 hover:text-rose-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-rose-500/10 text-xs font-medium"
                        title="Báo lỗi chương"
                    >
                        <Flag size={14} />
                        <span className="hidden sm:inline">Báo lỗi</span>
                    </button>
                </div>
            </div>

            {/* Reader Content */}
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
                    chapters={comic?.chapters || []}
                    currentChapterId={chapter?._id as string}
                    onPrev={handlePrevChapter} 
                    onNext={handleNextChapter} 
                />
            </div>
        
            {/* End of Chapter */}
            <div className="reader-end-section">
                <div className="reader-end-inner">
                    <div className="reader-end-actions">
                        <button 
                            onClick={handlePrevChapter}
                            className={`reader-end-btn reader-end-btn-secondary ${!hasPrev ? 'reader-end-btn-disabled' : ''}`}
                            disabled={!hasPrev}
                        >
                            <ChevronLeft size={18} />
                            Previous
                        </button>
                        <Link to={`/p/${comicId}`} className="reader-end-btn reader-end-btn-outline">
                            <BookOpen size={16} />
                            Comic Info
                        </Link>
                        <button 
                            onClick={handleNextChapter}
                            className={`reader-end-btn reader-end-btn-primary ${!hasNext ? 'reader-end-btn-disabled' : ''}`}
                            disabled={!hasNext}
                        >
                            Next
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>

            <CommentSection comicId={comicId!} chapterId={chapter._id || chapterId!} />

            <ReportModal 
                isOpen={reportModalOpen}
                onClose={() => setReportModalOpen(false)}
                targetType="chapter"
                targetId={chapter._id || chapterId!}
            />

            </main>
            <Footer />
        </div>
    );
};

export default ReadPage;
