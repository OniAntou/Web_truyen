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
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`${API_BASE_URL}/payment/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
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
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <div className="container" style={{ flex: 1, padding: '100px 20px 40px', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
                <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: '1.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(52, 211, 153, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', margin: '0 auto 1.5rem' }}>
                            <CreditCard size={32} />
                        </div>
                        <h1 style={{ color: 'var(--text-primary)', fontSize: '1.75rem', marginBottom: '0.5rem' }}>Nạp Linh Thạch</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Chọn số tiền bạn muốn nạp vào tài khoản</p>
                    </div>

                    {error && (
                        <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '0.75rem', color: '#ef4444', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <AlertCircle size={20} />
                            {error}
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                        {amounts.map((val) => (
                            <button
                                key={val}
                                onClick={() => setAmount(val)}
                                style={{
                                    padding: '1rem',
                                    borderRadius: '0.75rem',
                                    border: `2px solid ${amount === val ? 'var(--accent)' : 'var(--border)'}`,
                                    background: amount === val ? 'rgba(var(--accent-rgb), 0.1)' : 'transparent',
                                    color: amount === val ? 'var(--accent)' : 'var(--text-primary)',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    fontSize: '1rem'
                                }}
                            >
                                {val.toLocaleString()} VNĐ
                            </button>
                        ))}
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.75rem', fontSize: '0.9rem' }}>Số tiền khác (VNĐ)</label>
                        <input 
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            min="5000"
                            style={{
                                width: '100%',
                                padding: '1rem',
                                borderRadius: '0.75rem',
                                border: '1px solid var(--border)',
                                background: 'var(--bg-primary)',
                                color: 'var(--text-primary)',
                                fontSize: '1.1rem',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div style={{ background: 'var(--bg-primary)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Tỷ giá:</span>
                            <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>1,000 VNĐ = 100 Linh Thạch</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                            <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>Bạn sẽ nhận được:</span>
                            <span style={{ color: 'var(--accent)', fontWeight: 'bold', fontSize: '1.5rem' }}>
                                {(Math.floor(amount / 1000) * 100).toLocaleString()} <span style={{fontSize: '0.9rem'}}>Linh Thạch</span>
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={handleTopUp}
                        disabled={loading || amount < 5000}
                        className="nav-button accent"
                        style={{ width: '100%', height: '3.5rem', borderRadius: '0.75rem', fontSize: '1.1rem', fontWeight: 'bold' }}
                    >
                        {loading ? 'Đang kết nối tới VNPay...' : 'Tiến hành thanh toán'}
                    </button>
                    
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '1.5rem' }}>
                        Bằng việc nhấn thanh toán, bạn đồng ý với Điều khoản dịch vụ của chúng tôi.
                    </p>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default TopUpPage;
