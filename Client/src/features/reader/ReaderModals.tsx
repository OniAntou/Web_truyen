import React from 'react';
import { X, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { formatXu } from '../../constants/pricing';

export interface ConfirmModalState {
    isOpen: boolean;
    type: 'unlock' | 'vip' | '';
    message: string;
    price: number;
}

export interface AlertModalState {
    isOpen: boolean;
    title: string;
    message: string;
    isSuccess: boolean;
    /** Hành động CTA sau khi đóng alert; do caller quyết định, không đoán từ nội dung message. */
    action?: 'topup' | 'close';
}

interface ReaderModalsProps {
    confirmModal: ConfirmModalState;
    alertModal: AlertModalState;
    isProcessing: boolean;
    /** Số dư Xu hiện tại của user (null = chưa biết). */
    balance?: number | null;
    onConfirm: () => void;
    onCloseConfirm: () => void;
    onCloseAlert: () => void;
    onNavigateTopup: () => void;
}

const ReaderModals: React.FC<ReaderModalsProps> = ({
    confirmModal,
    alertModal,
    isProcessing,
    balance = null,
    onConfirm,
    onCloseConfirm,
    onCloseAlert,
    onNavigateTopup
}) => {
    return (
        <>
            {/* Confirm Modal */}
            {confirmModal.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-label="Xác nhận thanh toán"
                        className="border p-8 rounded-[2rem] max-w-sm w-full shadow-2xl relative text-center"
                        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
                    >
                        <button
                            type="button"
                            onClick={() => !isProcessing && onCloseConfirm()}
                            disabled={isProcessing}
                            aria-label="Đóng"
                            className="absolute right-6 top-6 transition-colors disabled:opacity-40"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            <X size={20} />
                        </button>
                        <div className="mx-auto w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mb-6">
                            <Lock size={28} className="text-yellow-500" />
                        </div>
                        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Xác nhận thanh toán</h3>
                        <p className="text-sm mb-8 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{confirmModal.message}</p>

                        <div className="rounded-xl p-4 mb-4 flex justify-between items-center border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Tổng thanh toán:</span>
                            <span className="text-yellow-500 font-bold text-lg">{formatXu(confirmModal.price)} Xu</span>
                        </div>
                        <div className="rounded-xl p-4 mb-8 flex justify-between items-center border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Số dư hiện có:</span>
                            <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                                {balance !== null ? `${formatXu(balance)} Xu` : '—'}
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={isProcessing}
                            className={`w-full font-bold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 ${
                                isProcessing ? 'cursor-not-allowed opacity-50' : ''
                            }`}
                            style={isProcessing ? { background: 'var(--bg-secondary)', color: 'var(--text-secondary)' } : { background: '#eab308', color: '#27272a' }}
                        >
                            {isProcessing ? 'Đang xử lý...' : 'Xác Nhận & Mở Khóa'}
                        </button>
                    </div>
                </div>
            )}

            {/* Alert/Result Modal */}
            {alertModal.isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div
                        role="alertdialog"
                        aria-modal="true"
                        aria-label={alertModal.title}
                        className="border p-8 rounded-[2rem] max-w-sm w-full shadow-2xl relative text-center"
                        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
                    >
                        <button
                            type="button"
                            onClick={onCloseAlert}
                            aria-label="Đóng"
                            className="absolute right-6 top-6 transition-colors"
                            style={{ color: 'var(--text-secondary)' }}
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
                        <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>{alertModal.title}</h3>
                        <p className="text-sm mb-8 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{alertModal.message}</p>

                        <button
                            type="button"
                            onClick={() => {
                                onCloseAlert();
                                if (alertModal.action === 'topup') {
                                    onNavigateTopup();
                                }
                            }}
                            className="w-full font-bold py-3.5 px-6 rounded-xl transition-all hover:brightness-110"
                            style={
                                alertModal.isSuccess || alertModal.action === 'topup'
                                    ? { background: '#eab308', color: '#27272a' }
                                    : { background: 'var(--accent-hover)', color: '#ffffff' }
                            }
                        >
                            {alertModal.isSuccess ? 'Đọc Tiếp' : alertModal.action === 'topup' ? 'Nạp Xu Ngay' : 'Đóng'}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default ReaderModals;
