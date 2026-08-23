import React, { useState } from 'react';
import { CreditCard, AlertCircle, CheckCircle2, Coins, ShieldCheck, Sparkles } from 'lucide-react';
import apiClient from '../../services/apiClient';

const TopUpPage: React.FC = () => {
    const [amount, setAmount] = useState(50000);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const amounts = [20000, 50000, 100000, 200000, 500000];

    const handleTopUp = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await apiClient<{ paymentUrl?: string; message?: string }>('/payment/create', {
                body: {
                    amount: amount,
                    bankCode: '',
                    locale: 'vn'
                }
            });

            if (data.paymentUrl) {
                window.location.href = data.paymentUrl;
            } else {
                setError(data.message || 'Không thể tạo yêu cầu thanh toán');
            }
        } catch (err) {
            console.error('TopUp error:', err);
            setError('Đã xảy ra lỗi khi kết nối với máy chủ thanh toán');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col font-sans">
            <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-20 md:pt-32 md:pb-28">
                {/* Header */}
                <div className="mb-10 sm:mb-12">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-[0.2em] uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-3">
                        <Coins size={12} /> Cửa Hàng Xu Đặc Quyền
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--text-primary)] mb-2">
                        Nạp <span className="text-amber-400">Xu ComicVerse</span>
                    </h1>
                    <p className="text-sm text-[var(--text-secondary)]">
                        Mua Xu để mở khoá đọc sớm các chương truyện mới nhất và ủng hộ tác giả.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left: Bundle Cards (col-span-7) */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="flex items-center gap-2">
                            <Sparkles size={16} className="text-amber-400" />
                            <h2 className="text-base font-extrabold text-[var(--text-primary)]">
                                Chọn gói Xu ưu đãi
                            </h2>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                            {amounts.map((val) => {
                                const isSelected = amount === val;
                                const coins = (val / 10).toLocaleString();
                                return (
                                    <button
                                        key={val}
                                        onClick={() => setAmount(val)}
                                        className={`relative p-4 rounded-3xl border transition-all duration-300 text-center select-none ${
                                            isSelected 
                                                ? 'bg-amber-500/10 border-amber-400/80 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/50 scale-[1.02]' 
                                                : 'bg-[var(--bg-secondary)] border-[var(--border)] hover:border-amber-400/40 hover:bg-[var(--bg-elevated)]'
                                        }`}
                                    >
                                        <div className="flex justify-center mb-3">
                                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors ${
                                                isSelected ? 'bg-amber-400 text-amber-950 font-black' : 'bg-[var(--bg-primary)] text-amber-400 border border-[var(--border)]'
                                            }`}>
                                                <Coins size={20} />
                                            </div>
                                        </div>

                                        <div className="text-lg font-black text-[var(--text-primary)] mb-0.5">
                                            {coins} <span className="text-xs font-bold text-amber-400">Xu</span>
                                        </div>

                                        <div className="text-xs font-bold text-[var(--text-secondary)]">
                                            {val.toLocaleString()}đ
                                        </div>

                                        {isSelected && (
                                            <div className="absolute top-3 right-3 text-amber-400">
                                                <CheckCircle2 size={16} fill="currentColor" className="text-amber-950" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right: Checkout Summary (col-span-5) */}
                    <div className="lg:col-span-5">
                        <div className="rounded-3xl p-6 sm:p-7 bg-[var(--bg-secondary)] border border-[var(--border)] shadow-xl sticky top-24">
                            <h3 className="text-base font-extrabold text-[var(--text-primary)] mb-5 pb-3 border-b border-[var(--border)]">
                                Chi Tiết Thanh Toán
                            </h3>
                            
                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between items-center text-xs font-medium">
                                    <span className="text-[var(--text-secondary)]">Tỷ giá quy đổi</span>
                                    <span className="text-[var(--text-primary)] font-bold">1,000đ = 100 Xu</span>
                                </div>
                                <div className="flex justify-between items-center text-xs font-medium">
                                    <span className="text-[var(--text-secondary)]">Cổng thanh toán</span>
                                    <span className="text-[var(--text-primary)] font-bold">VNPay QR / ATM / Visa</span>
                                </div>

                                <div className="pt-2 border-t border-[var(--border)] flex justify-between items-center">
                                    <span className="text-xs font-bold text-[var(--text-secondary)]">Tổng thanh toán</span>
                                    <span className="text-lg font-black text-[var(--text-primary)]">
                                        {amount.toLocaleString()}đ
                                    </span>
                                </div>

                                <div className="flex justify-between items-center p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                                    <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">Thực nhận</span>
                                    <span className="text-2xl font-black text-amber-400">
                                        {(Math.floor(amount / 1000) * 100).toLocaleString()} <span className="text-xs">Xu</span>
                                    </span>
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold mb-5 flex items-start gap-2">
                                    <AlertCircle size={15} className="shrink-0 mt-0.5" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <button
                                onClick={handleTopUp}
                                disabled={loading || amount < 10000}
                                className="w-full py-4 rounded-full font-black text-xs uppercase tracking-widest text-amber-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-95 shadow-xl shadow-amber-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <CreditCard size={15} />
                                <span>{loading ? 'Đang khởi tạo VNPay...' : 'Thanh Toán Ngay'}</span>
                            </button>

                            <div className="flex items-center justify-center gap-1.5 mt-5 text-[11px] text-[var(--text-muted)]">
                                <ShieldCheck size={14} className="text-emerald-500" />
                                <span>Bảo mật chuẩn quốc gia qua VNPay</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopUpPage;
