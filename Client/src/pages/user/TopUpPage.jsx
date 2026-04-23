import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Layout/Navbar';
import Footer from '../../components/Layout/Footer';
import { CreditCard, AlertCircle, CheckCircle2 } from 'lucide-react';
import { API_BASE_URL } from '../../constants/api';

const TopUpPage = () => {
    const [amount, setAmount] = useState(50000);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const amounts = [20000, 50000, 100000, 200000, 500000];

    const handleTopUp = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE_URL}/payment/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    amount: amount,
                    bankCode: '', // Leave empty for VNPay bank selection page
                    locale: 'vn'
                })
            });

            const data = await response.json();
            if (data.paymentUrl) {
                // Redirect user to VNPay
                window.location.href = data.paymentUrl;
            } else {
                setError(data.message || 'Không thể tạo yêu cầu thanh toán');
            }
        } catch (err) {
            console.error('TopUp error:', err);
            setError('Đã xảy ra lỗi khi kết nối với máy chủ');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col font-sans" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
            <Navbar />
            <div className="flex-1 w-full max-w-5xl mx-auto px-4 pt-24 pb-16">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2 pb-4" style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border)' }}>Nạp Xu</h1>
                    <p className="text-sm mt-3" style={{ color: 'var(--text-secondary)' }}>Mua Xu để mở khóa truy cập sớm các chapter truyện đặc quyền.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Bundles & Custom */}
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <h2 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Các gói Xu ưu đãi</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {amounts.map((val) => (
                                    <button
                                        key={val}
                                        onClick={() => setAmount(val)}
                                        className="relative p-5 rounded-2xl border text-center transition-colors"
                                        style={{
                                            borderColor: amount === val ? '#eab308' : 'var(--border)',
                                            backgroundColor: amount === val ? 'rgba(234, 179, 8, 0.05)' : 'var(--bg-secondary)',
                                        }}
                                        onMouseEnter={(e) => { if (amount !== val) e.currentTarget.style.borderColor = 'var(--text-secondary)'; }}
                                        onMouseLeave={(e) => { if (amount !== val) e.currentTarget.style.borderColor = 'var(--border)'; }}
                                    >
                                        <div className="flex justify-center mb-2">
                                            <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                                                <CreditCard size={18} />
                                            </div>
                                        </div>
                                        <div className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                                            {(val / 10).toLocaleString()} <span className="text-xs text-yellow-500">Xu</span>
                                        </div>
                                        <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                                            {val.toLocaleString()}đ
                                        </div>
                                        {amount === val && (
                                            <div className="absolute top-3 right-3 text-yellow-500">
                                                <CheckCircle2 size={16} />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Checkout Summary */}
                    <div>
                        <div className="rounded-2xl p-6 sticky top-24" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                            <h3 className="text-lg font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Chi tiết thanh toán</h3>
                            
                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>Tỷ giá quy đổi</span>
                                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>1,000đ = 100 Xu</span>
                                </div>
                                <div className="h-px" style={{ backgroundColor: 'var(--border)' }}></div>
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Tổng thanh toán</span>
                                    <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                                        {amount.toLocaleString()}đ
                                    </span>
                                </div>
                                <div className="flex justify-between items-center bg-yellow-500/5 p-4 rounded-xl border border-yellow-500/10">
                                    <span className="text-yellow-500 font-bold">Thực nhận</span>
                                    <span className="text-3xl font-black text-yellow-500">
                                        {(Math.floor(amount / 1000) * 100).toLocaleString()} <span className="text-sm">Xu</span>
                                    </span>
                                </div>
                            </div>

                            {error && (
                                <div className="text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-sm font-medium mb-6 flex items-start gap-2">
                                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <button
                                onClick={handleTopUp}
                                disabled={loading || amount < 10000}
                                className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wide transition-colors flex items-center justify-center gap-2 ${
                                    loading || amount < 10000 
                                    ? 'cursor-not-allowed' 
                                    : 'bg-yellow-500 hover:bg-yellow-400 text-black'
                                }`}
                                style={loading || amount < 10000 ? { backgroundColor: 'var(--border)', color: 'var(--text-secondary)' } : {}}
                            >
                                {loading ? 'Đang khởi tạo VNPay...' : 'Thanh Toán Ngay'}
                            </button>
                            <p className="text-xs text-center mt-5 px-4 font-medium leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                Giao dịch được mã hóa bảo mật 100% qua cổng thanh toán quốc gia VNPay.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default TopUpPage;
