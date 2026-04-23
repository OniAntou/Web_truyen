import React, { useState } from 'react';
import { X, AlertTriangle, Send, CheckCircle } from 'lucide-react';
import { CHAPTER_REPORT_REASONS, COMMENT_REPORT_REASONS } from '../../constants/reportReasons';
import { reportService } from '../../api/reportService';

const ReportModal = ({ isOpen, onClose, targetType, targetId, onSuccess }) => {
    const [selectedReason, setSelectedReason] = useState('');
    const [detail, setDetail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState(null);

    const reasons = targetType === 'chapter' ? CHAPTER_REPORT_REASONS : COMMENT_REPORT_REASONS;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedReason) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const reasonLabel = reasons.find(r => r.id === selectedReason)?.label || selectedReason;
            await reportService.createReport({
                target_type: targetType,
                target_id: targetId,
                reason: reasonLabel,
                detail: detail
            });
            setIsSuccess(true);
            if (onSuccess) onSuccess();
            setTimeout(() => {
                onClose();
                // Reset state after closing
                setTimeout(() => {
                    setIsSuccess(false);
                    setSelectedReason('');
                    setDetail('');
                }, 300);
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại sau.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-zinc-950 border border-white/10 p-6 md:p-8 rounded-[2rem] max-w-md w-full shadow-2xl relative">
                <button 
                    onClick={onClose}
                    className="absolute right-6 top-6 text-zinc-500 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                {isSuccess ? (
                    <div className="text-center py-8 animate-in zoom-in-95 duration-300">
                        <div className="mx-auto w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-6 border-4 border-green-500/20">
                            <CheckCircle size={40} className="text-green-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Cảm ơn bạn!</h3>
                        <p className="text-zinc-400">Báo cáo của bạn đã được gửi thành công. Chúng tôi sẽ xem xét trong thời gian sớm nhất.</p>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                                <AlertTriangle size={20} className="text-rose-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white">
                                {targetType === 'chapter' ? 'Báo lỗi Chapter' : 'Báo cáo Bình luận'}
                            </h3>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-zinc-400 text-sm font-medium mb-2">Lý do báo cáo</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {reasons.map((reason) => (
                                        <label 
                                            key={reason.id}
                                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                                                selectedReason === reason.id 
                                                ? 'bg-rose-500/10 border-rose-500/50 text-rose-500' 
                                                : 'bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10'
                                            }`}
                                        >
                                            <input 
                                                type="radio" 
                                                name="reportReason"
                                                value={reason.id}
                                                checked={selectedReason === reason.id}
                                                onChange={(e) => setSelectedReason(e.target.value)}
                                                className="hidden"
                                            />
                                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedReason === reason.id ? 'border-rose-500' : 'border-zinc-600'}`}>
                                                {selectedReason === reason.id && <div className="w-2 h-2 rounded-full bg-rose-500" />}
                                            </div>
                                            <span className="text-sm font-medium">{reason.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {selectedReason === 'OTHER' && (
                                <div className="animate-in slide-in-from-top-2 duration-200">
                                    <label className="block text-zinc-400 text-sm font-medium mb-2">Chi tiết thêm</label>
                                    <textarea 
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-rose-500/50 min-h-[100px] resize-none"
                                        placeholder="Vui lòng mô tả chi tiết vấn đề..."
                                        value={detail}
                                        onChange={(e) => setDetail(e.target.value)}
                                        required
                                    />
                                </div>
                            )}

                            {error && (
                                <p className="text-rose-500 text-xs mt-2 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">{error}</p>
                            )}

                            <button 
                                type="submit"
                                disabled={!selectedReason || isSubmitting}
                                className={`w-full font-bold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 mt-4 ${
                                    !selectedReason || isSubmitting
                                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                                    : 'bg-rose-500 hover:bg-rose-400 text-white shadow-[0_0_20px_rgba(244,63,94,0.3)]'
                                }`}
                            >
                                {isSubmitting ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Send size={18} />
                                        Gửi báo cáo
                                    </>
                                )}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default ReportModal;
