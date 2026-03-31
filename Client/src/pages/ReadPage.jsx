import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight, ChevronLeft, BookOpen, Home, Lock, X, AlertCircle, CheckCircle } from 'lucide-react';
import Navbar from '../components/Layout/Navbar';
import ReaderControls from '../components/Reader/ReaderControls';
import LazyImage from '../components/ui/LazyImage';
import Footer from '../components/Layout/Footer';
import CommentSection from '../components/Comic/CommentSection';
import { comicService } from '../api/comicService';
import { chapterService } from '../api/chapterService';
import { API_BASE_URL } from '../constants/api';

const ReadPage = () => {
    const { comicId, chapterId } = useParams();
    const navigate = useNavigate();
    const [comic, setComic] = useState(null);
    const [chapter, setChapter] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: '', message: '', price: 0 });
    const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '', isSuccess: false });
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDarkTheme, setIsDarkTheme] = useState(true);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const checkTheme = () => {
            setIsDarkTheme(document.documentElement.getAttribute('data-theme') !== 'light');
        };
        checkTheme();
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);
        setLoading(true);
        setError(null);

        comicService.getById(comicId)
            .then(data => {
                setComic(data);
                if (data.chapters) {
                    const found = data.chapters.find(c => c._id === chapterId || c.id === chapterId);
                    if (found) {
                        // Fetch pages specifically for this chapter
                        chapterService.getPages(found._id)
                            .then(pages => {
                                setChapter({ ...found, pages });
                                setLoading(false);
                            })
                            .catch(err => {
                                console.error('Error fetching pages:', err);
                                if (err.is_locked) {
                                    setError({ type: 'locked', message: err.message, price: err.price, early_access_end_date: err.early_access_end_date });
                                } else {
                                    setError(err.message || 'Failed to load chapter pages');
                                }
                                setChapter(found);
                                setLoading(false);
                            });
                    } else {
                        setError('Chapter not found');
                        setLoading(false);
                    }
                } else {
                    setError('No chapters found');
                    setLoading(false);
                }
            })
            .catch(err => {
                console.error(err);
                setError(err.message);
                setLoading(false);
            });
    }, [comicId, chapterId]);



    const viewedRef = React.useRef(null);

    // Mark chapter as read only when user can actually view pages (not locked)
    useEffect(() => {
        if (token && comic && chapter && chapter.pages && chapter.pages.length > 0) {
            console.log('ReadPage: Chapter loaded with pages, marking as read:', chapter.title);
            updateReadingProgress(1);
        }
    }, [chapter?._id, chapter?.pages?.length]); // Only run when chapter or its pages change

    // Track reading progress
    const updateReadingProgress = async (pageNum) => {
        if (!token || !comic || !chapter) return;
        
        try {
            console.log('Updating reading progress:', { chapter_id: chapter._id, page_number: pageNum });
            await comicService.updateReadingProgress(comicId, chapter._id, pageNum, token);
            console.log('Reading progress updated successfully');
        } catch (err) {
            console.error('Error updating reading progress:', err);
        }
    };



    // Track comic view for authenticated users
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token && comicId && viewedRef.current !== comicId) {
            viewedRef.current = comicId;
            comicService.updateView(comicId, token).catch(console.error);
        }
    }, [comicId]);

    const currentIndex = comic?.chapters?.findIndex(c => c._id === chapter?._id) ?? -1;
    const hasPrev = currentIndex > 0;
    const hasNext = comic?.chapters && currentIndex < comic.chapters.length - 1;

    const handleNextChapter = () => {
        if (!comic || !chapter || !hasNext) return;
        const nextChapter = comic.chapters[currentIndex + 1];
        navigate(`/read/${comicId}/${nextChapter._id}`);
    };

    const handlePrevChapter = () => {
        if (!comic || !chapter || !hasPrev) return;
        const prevChapter = comic.chapters[currentIndex - 1];
        navigate(`/read/${comicId}/${prevChapter._id}`);
    };

    const handleUnlock = () => {
        if (!token) return navigate('/login');
        setConfirmModal({ 
            isOpen: true, 
            type: 'unlock', 
            message: `Xác nhận dùng ${error?.price || 0} Xu để mở khóa chương này?`, 
            price: error?.price || 0 
        });
    };

    const handleUpgradeVip = () => {
        if (!token) return navigate('/login');
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
                await chapterService.unlockChapter(chapter?._id || chapterId, token);
                setConfirmModal({ ...confirmModal, isOpen: false });
                setAlertModal({ isOpen: true, title: 'Thành công', message: 'Mở khóa chương thành công!', isSuccess: true });
                setTimeout(() => window.location.reload(), 1500);
            } else if (confirmModal.type === 'vip') {
                const response = await fetch(`${API_BASE_URL}/users/upgrade-vip`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message);
                setConfirmModal({ ...confirmModal, isOpen: false });
                setAlertModal({ isOpen: true, title: 'Thành công', message: 'Nâng cấp VIP thành công! Hệ thống sẽ tự động tải lại trang.', isSuccess: true });
                setTimeout(() => window.location.reload(), 2000);
            }
        } catch (err) {
            setConfirmModal({ ...confirmModal, isOpen: false });
            setAlertModal({ isOpen: true, title: 'Giao dịch thất bại', message: err.message || "Lỗi không xác định", isSuccess: false });
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) return <div style={{ paddingTop: '5rem', textAlign: 'center', color: 'white' }}>Loading...</div>;

    if (error && error.type === 'locked') {
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
                        
                        {(error.early_access_end_date || chapter?.early_access_end_date) && new Date(error.early_access_end_date || chapter.early_access_end_date) > new Date() && (
                            <div className="mb-4">
                                <span className="bg-yellow-500/10 text-yellow-500 px-4 py-1.5 rounded-full text-[0.7rem] uppercase tracking-widest font-bold border border-yellow-500/20 inline-block shadow-sm">
                                    Mở miễn phí vào {new Date(error.early_access_end_date || chapter.early_access_end_date).toLocaleDateString('vi-VN')}
                                </span>
                            </div>
                        )}
                        
                        <h2 className="text-xl font-bold mb-2">Chương Yêu Cầu Trả Phí</h2>
                        <p className={`${isDarkTheme ? 'text-zinc-400' : 'text-zinc-500'} text-sm mb-6 leading-relaxed`}>
                            Bạn cần dùng Xu để đọc trước chương này. <br/>
                            Hoặc đăng ký tài khoản VIP để đọc toàn bộ truyện miễn phí!
                        </p>
                        
                        <div className="space-y-3 w-full max-w-[300px] mx-auto">
                            <button 
                                onClick={handleUnlock}
                                className={`w-full ${isDarkTheme ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-zinc-100 hover:bg-zinc-200'} border border-white/5 text-${isDarkTheme ? 'white' : 'black'} font-semibold py-3 px-6 rounded-2xl transition-colors flex items-center justify-center gap-2 text-sm`}
                            >
                                <Lock size={16} className="text-yellow-500" />
                                Mở khóa ({error.price} Xu)
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

    if (error) return <div style={{ paddingTop: '5rem', textAlign: 'center', color: 'red' }}>Error: {typeof error === 'string' ? error : error.message}</div>;
    if (!comic || !chapter) return <div style={{ paddingTop: '5rem', textAlign: 'center', color: 'white' }}>Content not found</div>;

    const pages = chapter.pages || [];

    return (
        <div className="reader-page">
            <Navbar />

            {/* Reader Info Bar */}
            <div className="reader-info-bar">
                <div className="reader-info-content">
                    <Link to={`/p/${comicId}`} className="reader-info-back" title="Back to Comic">
                        <ArrowLeft size={16} />
                        {comic.title}
                    </Link>

                    {chapter.title && (
                        <span className="reader-info-center-chapter">
                            {chapter.title}
                        </span>
                    )}

                    {chapter.title && <div className="reader-info-spacer"></div>}
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
                    comicId={comicId} 
                    chapters={comic?.chapters || []}
                    currentChapterId={chapter?._id}
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

            <CommentSection comicId={comicId} chapterId={chapter._id || chapter.id} />

            <Footer />
        </div>
    );
};

export default ReadPage;

