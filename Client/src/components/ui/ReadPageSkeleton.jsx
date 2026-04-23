import React from 'react';
import Navbar from '../Layout/Navbar';

const ReadPageSkeleton = () => (
    <div className="reader-page bg-[var(--bg-primary)] min-h-screen">
        <Navbar />
        <main className="pt-20">
            {/* Top Bar Skeleton */}
            <div className="border-b border-[var(--border)] bg-[var(--bg-secondary)] py-3 px-4 mb-4">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="h-4 w-32 rounded bg-[var(--bg-primary)] animate-pulse" />
                    <div className="h-4 w-48 rounded bg-[var(--bg-primary)] animate-pulse hidden sm:block" />
                    <div className="h-4 w-12 rounded bg-[var(--bg-primary)] animate-pulse" />
                </div>
            </div>

            {/* Content Skeleton */}
            <div className="reader-container max-w-3xl mx-auto space-y-4 p-4">
                <div className="aspect-[2/3] w-full rounded-lg bg-[var(--bg-secondary)] animate-pulse relative overflow-hidden">
                    <div className="absolute inset-0" style={{
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
                        animation: 'shimmer 1.5s infinite'
                    }} />
                </div>
                <div className="aspect-[2/3] w-full rounded-lg bg-[var(--bg-secondary)] animate-pulse relative overflow-hidden">
                    <div className="absolute inset-0" style={{
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
                        animation: 'shimmer 1.5s infinite'
                    }} />
                </div>
            </div>
        </main>
    </div>
);

export default ReadPageSkeleton;
