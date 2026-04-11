import React from 'react';

const SkeletonCard = () => (
    <div className="flex flex-col gap-3 animate-pulse">
        <div 
            className="aspect-[2/3] w-full rounded-2xl ring-1 ring-[var(--border)]" 
            style={{ background: 'var(--bg-secondary)' }}
        >
            {/* Shimmer effect */}
            <div className="w-full h-full rounded-2xl overflow-hidden relative">
                <div 
                    className="absolute inset-0" 
                    style={{
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
                        animation: 'shimmer 1.5s infinite'
                    }}
                />
            </div>
        </div>
        <div className="px-1 space-y-2">
            <div className="h-4 w-3/4 rounded-lg" style={{ background: 'var(--bg-secondary)' }} />
            <div className="h-3 w-1/2 rounded-lg" style={{ background: 'var(--bg-secondary)' }} />
        </div>
    </div>
);

export default SkeletonCard;
