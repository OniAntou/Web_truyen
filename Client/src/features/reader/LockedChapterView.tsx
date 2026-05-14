import React from 'react';
import { Lock } from 'lucide-react';
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
    isDarkTheme: boolean;
    onUnlock: () => void;
    onUpgradeVip: () => void;
}

const LockedChapterView: React.FC<LockedChapterViewProps> = ({ 
    error, 
    isDarkTheme, 
    onUnlock, 
    onUpgradeVip 
}) => {
    const earlyAccessDate = error.early_access_end_date;
    const isEarlyAccess = !!(earlyAccessDate && new Date(earlyAccessDate).getTime() > Date.now());

    return (
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
                
                {isEarlyAccess && (
                    <div className="mb-4">
                        <span className="bg-yellow-500/10 text-yellow-500 px-4 py-1.5 rounded-full text-[0.7rem] uppercase tracking-widest font-bold border border-yellow-500/20 inline-block shadow-sm">
                            Mở miễn phí vào {new Date(earlyAccessDate!).toLocaleDateString('vi-VN')}
                        </span>
                    </div>
                )}
                
                <h2 className="text-xl font-bold mb-2">Chapter Yêu Cầu Trả Phí</h2>
                <p className={`${isDarkTheme ? 'text-zinc-400' : 'text-zinc-500'} text-sm mb-6 leading-relaxed`}>
                    Bạn cần dùng Xu để đọc trước chapter này. <br/>
                    Hoặc đăng ký tài khoản VIP để đọc toàn bộ truyện miễn phí!
                </p>
                
                <div className="space-y-3 w-full max-w-[300px] mx-auto">
                    <button 
                        onClick={onUnlock}
                        className={`w-full ${isDarkTheme ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-zinc-100 hover:bg-zinc-200'} border border-white/5 text-${isDarkTheme ? 'white' : 'black'} font-semibold py-3 px-6 rounded-2xl transition-colors flex items-center justify-center gap-2 text-sm`}
                    >
                        <Lock size={16} className="text-yellow-500" />
                        Mở khóa ({error.price} Xu)
                    </button>
                    <button 
                        onClick={onUpgradeVip}
                        className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-black hover:brightness-110 font-bold py-3 px-6 rounded-2xl transition-all shadow-[0_0_20px_rgba(234,179,8,0.15)] text-sm"
                    >
                        Đăng ký VIP (50.000 Xu / Tháng)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LockedChapterView;
