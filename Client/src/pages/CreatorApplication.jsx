import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, CheckCircle2 } from 'lucide-react';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import { API_BASE_URL } from '../constants/api';
import { clearSession } from '../utils/auth';

const CreatorApplication = () => {
    const [formData, setFormData] = useState({
        penName: '',
        portfolio: '',
        reason: '',
    });
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            setError('Vui lòng đăng nhập trước khi nộp đơn.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API_BASE_URL}/applications`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            if (res.status === 401) {
                clearSession();
                return;
            }

            const data = await res.json();
            
            if (res.ok) {
                setSubmitted(true);
            } else {
                setError(data.message || 'Có lỗi xảy ra.');
            }
        } catch (err) {
            setError('Lỗi kết nối máy chủ.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
                <Navbar />
                <div className="flex-1 flex justify-center items-center p-6 md:p-12">
                    <div className="max-w-md w-full text-center space-y-6">
                        <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-8" style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                            <CheckCircle2 size={48} color="#22c55e" strokeWidth={1.5} />
                        </div>
                        <h2 className="text-4xl font-light tracking-tight" style={{ color: 'var(--text-primary)' }}>Đã Xong!</h2>
                        <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                            Cảm ơn bạn đã đăng ký trở thành người sáng tạo. Đội ngũ quản trị sẽ xem xét đơn của bạn và sớm phản hồi lại nhé.
                        </p>
                        <Link to="/" className="inline-block w-full py-4 rounded-xl font-bold transition-all hover:opacity-90 mt-8" style={{ background: 'var(--accent)', color: 'white' }}>
                            Quay Về Trang Chủ
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
            <Navbar />
            <div className="flex-1 flex justify-center p-6 py-20 md:py-32">
                <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                    
                    {/* Left Column: Typography */}
                    <div className="space-y-8">
                        <div className="inline-block px-5 py-2 rounded-full text-xs font-bold tracking-widest uppercase transition-colors" style={{ background: 'var(--bg-secondary)', color: 'var(--accent)', border: '1px solid var(--border)' }}>
                            Tham gia cộng đồng
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-light tracking-tighter leading-tight" style={{ color: 'var(--text-primary)' }}>
                            Khơi Nguồn <br/><span className="font-bold">Sáng Tạo.</span>
                        </h1>
                        <p className="text-lg leading-relaxed max-w-lg" style={{ color: 'var(--text-secondary)' }}>
                            Trở thành một mảnh ghép cốt lõi của website. Được cấp quyền đầy đủ để bạn tự do đăng tải, tùy biến và chia sẻ những tác phẩm yêu thích tới hàng ngàn độc giả toàn cầu.
                        </p>
                    </div>

                    {/* Right Column: Clean Form */}
                    {!user ? (
                        <div className="p-8 md:p-12 rounded-[2rem] shadow-2xl relative text-center" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                            <h3 className="text-2xl font-medium text-white mb-4">Bạn chưa đăng nhập!</h3>
                            <p className="text-zinc-400 mb-8">Vui lòng đăng nhập vào tài khoản của bạn để có thể nộp đơn xin cấp quyền Tác giả.</p>
                            <Link to="/auth" className="inline-block px-8 py-4 rounded-xl font-bold bg-[var(--accent)] text-white hover:opacity-90 transition-all">
                                Đi đến Đăng Nhập
                            </Link>
                        </div>
                    ) : (
                    <form onSubmit={handleSubmit} className="space-y-8 p-8 md:p-12 rounded-[2rem] shadow-2xl relative" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                        {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm">{error}</div>}
                        
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest mb-3 ml-1" style={{ color: 'var(--text-secondary)' }}>Bút danh / Tên Nhóm <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={formData.penName}
                                onChange={(e) => setFormData({...formData, penName: e.target.value})}
                                required
                                className="w-full p-4 md:p-5 rounded-2xl outline-none transition-all duration-300 hover:opacity-80 focus:opacity-100"
                                style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                                placeholder="Tên hiển thị của bạn trên các chapter truyện..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest mb-3 ml-1" style={{ color: 'var(--text-secondary)' }}>Kinh nghiệm / Tác phẩm</label>
                            <input
                                type="url"
                                value={formData.portfolio}
                                onChange={(e) => setFormData({...formData, portfolio: e.target.value})}
                                className="w-full p-4 md:p-5 rounded-2xl outline-none transition-all duration-300 hover:opacity-80 focus:opacity-100"
                                style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                                placeholder="https://"
                            />
                            <p className="text-xs mt-3 ml-1 leading-relaxed opacity-80" style={{ color: 'var(--text-secondary)' }}>Đường dẫn tới trang thư viện cá nhân, hoặc danh sách truyện bạn từng dịch thuật (nếu có).</p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest mb-3 ml-1" style={{ color: 'var(--text-secondary)' }}>Lời Giới Thiệu <span className="text-red-500">*</span></label>
                            <textarea
                                value={formData.reason}
                                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                                required
                                className="w-full p-4 md:p-5 rounded-2xl outline-none transition-all duration-300 hover:opacity-80 focus:opacity-100 h-32 md:h-40 resize-none"
                                style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                                placeholder="Thể loại bạn định làm, mục tiêu tham gia của bạn là gì..."
                            />
                        </div>

                        <button type="submit" disabled={loading} className="w-full py-5 md:py-6 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:opacity-90 mt-4 text-sm tracking-widest uppercase disabled:opacity-50 disabled:hover:scale-100" style={{ background: 'var(--accent)', color: 'white' }}>
                            <span>{loading ? 'Đang gửi...' : 'Nộp Đơn Ứng Tuyển'}</span>
                            {!loading && <Send size={18} strokeWidth={2.5} />}
                        </button>
                    </form>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default CreatorApplication;
