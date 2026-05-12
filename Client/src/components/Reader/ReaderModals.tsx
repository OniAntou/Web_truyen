import React from 'react';
import { X, Lock, CheckCircle, AlertCircle } from 'lucide-react';

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
}

interface ReaderModalsProps {
    confirmModal: ConfirmModalState;
    alertModal: AlertModalState;
    isProcessing: boolean;
    onConfirm: () => void;
    onCloseConfirm: () => void;
    onCloseAlert: () => void;
    onNavigateTopup: () => void;
}

const ReaderModals: React.FC<ReaderModalsProps> = ({
    confirmModal,
    alertModal,
    isProcessing,
    onConfirm,
    onCloseConfirm,
    onCloseAlert,
    onNavigateTopup
}) => {
    return (
        <>
            {/* Confirm Modal */}
            {confirmModal.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-zinc-950 border border-white/10 p-8 rounded-[2rem] max-w-sm w-full shadow-2xl relative text-center">
                        <button 
                            onClick={() => !isProcessing && onCloseConfirm()}
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
                            onClick={onConfirm}
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
                            onClick={onCloseAlert}
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
                                onCloseAlert();
                                if(!alertModal.isSuccess && alertModal.message.includes("không đủ")) {
                                    onNavigateTopup();
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
        </>
    );
};

export default ReaderModals;
