import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ReaderErrorStateProps {
    title: string;
    message?: string;
    children?: React.ReactNode;
}

/**
 * Trang thai loi dung chung cua reader: thong bao ro rang + cac loai thoat
 * hanh dong (thu lai, ve trang chu...). Luon dung token theme, khong hardcode mau.
 */
const ReaderErrorState: React.FC<ReaderErrorStateProps> = ({ title, message, children }) => {
    return (
        <div
            role="alert"
            className="flex flex-col items-center gap-3 px-4 text-center"
            style={{ paddingTop: '8rem', paddingBottom: '8rem', color: 'var(--text-primary)' }}
        >
            <AlertCircle size={44} style={{ color: 'var(--text-secondary)' }} aria-hidden="true" />
            <h2 className="text-xl font-bold">{title}</h2>
            {message && (
                <p className="max-w-[26rem] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {message}
                </p>
            )}
            {children && <div className="mt-4 flex flex-wrap justify-center gap-3">{children}</div>}
        </div>
    );
};

export default ReaderErrorState;
