import React from 'react';
import { Lock } from 'lucide-react';
import { VIP_PRICE_PER_MONTH_XU, formatXu } from '../../constants/pricing';
import { Comic } from '../../types/comic';

interface LockedError {
    is_locked: boolean;
    type: 'locked';
    message: string;
    price: number;
    early_access_end_date?: string;
    comic?: Partial<Comic>;
}

interface LockedChapterViewProps {
    error: LockedError;
    onUnlock: () => void;
    onUpgradeVip: () => void;
}

const LockedChapterView: React.FC<LockedChapterViewProps> = ({
    error,
    onUnlock,
    onUpgradeVip
}) => {
    const earlyAccessDate = error.early_access_end_date;
    const isEarlyAccess = !!(earlyAccessDate && new Date(earlyAccessDate).getTime() > Date.now());

    return (
        <div
            className="flex flex-col items-center justify-center px-4"
            style={{ paddingTop: '8rem', textAlign: 'center', color: 'var(--text-primary)', minHeight: '60vh' }}
        >
            <div className="p-8 rounded-3xl border backdrop-blur-md max-w-md w-full shadow-xl"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
            >
                <Lock size={48} className="mx-auto mb-4" style={{ color: 'var(--warning)' }} />

                {isEarlyAccess && (
                    <div className="mb-4">
                        <span className="bg-yellow-500/10 px-4 py-1.5 rounded-full text-xs uppercase tracking-widest font-bold border border-yellow-500/20 inline-block shadow-sm" style={{ color: 'var(--warning)' }}>
                            Mở miễn phí vào {new Date(earlyAccessDate!).toLocaleDateString('vi-VN')}
                        </span>
                    </div>
                )}

                <h2 className="text-xl font-bold mb-2">Chapter Yêu Cầu Trả Phí</h2>
                <p className="text-sm mb-6 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    Bạn cần dùng Xu để đọc trước chapter này. <br />
                    Hoặc đăng ký tài khoản VIP để đọc toàn bộ truyện miễn phí!
                </p>

                <div className="space-y-3 w-full max-w-[300px] mx-auto">
                    <button
                        type="button"
                        onClick={onUnlock}
                        className="w-full border font-semibold py-3 px-6 rounded-2xl transition-colors flex items-center justify-center gap-2 text-sm hover:brightness-110"
                        style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
                    >
                        <Lock size={16} style={{ color: 'var(--warning)' }} />
                        Mở khóa ({formatXu(error.price)} Xu)
                    </button>
                    <button
                        type="button"
                        onClick={onUpgradeVip}
                        className="w-full bg-yellow-500 hover:bg-yellow-400 font-bold py-3 px-6 rounded-2xl transition-colors shadow-sm text-sm"
                        style={{ color: '#27272a' }}
                    >
                        Đăng ký VIP ({formatXu(VIP_PRICE_PER_MONTH_XU)} Xu / Tháng)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LockedChapterView;
