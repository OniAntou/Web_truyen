import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Layout/Navbar';
import Footer from '../../components/Layout/Footer';
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../../constants/api';

const PaymentReturnPage = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('loading'); // loading, success, failed, error
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                // Send VNPay parameters to our backend to verify
                const response = await fetch(`${API_BASE_URL}/payment/vnpay_return?${searchParams.toString()}`, {
                    credentials: 'include'
                });
                const data = await response.json();

                if (data.success) {
                    setStatus('success');
                } else {
                    setStatus('failed');
                    setMessage(data.message || 'Thanh toán không thành công');
                }
            } catch (err) {
                console.error('Verify error:', err);
                setStatus('error');
                setMessage('Không thể xác thực giao dịch');
            }
        };

        verifyPayment();
    }, [searchParams]);

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <div className="container" style={{ flex: 1, padding: '100px 20px 40px', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
                <div className="glass-panel" style={{ padding: '3rem', borderRadius: '1.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)', textAlign: 'center' }}>
                    
                    {status === 'loading' && (
                        <div>
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(var(--accent-rgb), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', margin: '0 auto 2rem' }}>
                                <Loader2 size={48} className="spin" />
                            </div>
                            <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Đang xác thực giao dịch...</h2>
                            <p style={{ color: 'var(--text-secondary)' }}>Vui lòng không đóng trình duyệt trong lúc này.</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div>
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', margin: '0 auto 2rem' }}>
                                <CheckCircle2 size={48} />
                            </div>
                            <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '1.75rem' }}>Thanh toán thành công!</h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>Linh thạch đã được cộng vào tài khoản của bạn.</p>
                            <button 
                                onClick={() => navigate('/profile')} 
                                className="nav-button accent"
                                style={{ width: '100%', height: '3.5rem', borderRadius: '0.75rem', fontSize: '1.1rem', fontWeight: 'bold' }}
                            >
                                Quay lại Trang cá nhân
                            </button>
                        </div>
                    )}

                    {status === 'failed' && (
                        <div>
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', margin: '0 auto 2rem' }}>
                                <XCircle size={48} />
                            </div>
                            <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '1.75rem' }}>Thanh toán thất bại</h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>{message}</p>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button 
                                    onClick={() => navigate('/payment/topup')} 
                                    style={{ flex: 1, height: '3.5rem', borderRadius: '0.75rem', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-primary)', fontWeight: 'bold', cursor: 'pointer' }}
                                >
                                    Thử lại
                                </button>
                                <button 
                                    onClick={() => navigate('/profile')} 
                                    className="nav-button accent"
                                    style={{ flex: 1, height: '3.5rem', borderRadius: '0.75rem', fontWeight: 'bold' }}
                                >
                                    Về Trang cá nhân
                                </button>
                            </div>
                        </div>
                    )}

                    {status === 'error' && (
                        <div>
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', margin: '0 auto 2rem' }}>
                                <AlertCircle size={48} />
                            </div>
                            <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '1.75rem' }}>Đã có lỗi xảy ra</h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>{message}</p>
                            <button 
                                onClick={() => navigate('/profile')} 
                                className="nav-button accent"
                                style={{ width: '100%', height: '3.5rem', borderRadius: '0.75rem', fontWeight: 'bold' }}
                            >
                                Quay lại Trang cá nhân
                            </button>
                        </div>
                    )}

                </div>
            </div>
            <Footer />
        </div>
    );
};

export default PaymentReturnPage;
