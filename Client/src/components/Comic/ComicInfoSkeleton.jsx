import React from 'react';
import Navbar from '../Layout/Navbar';
import Footer from '../Layout/Footer';

const ComicInfoSkeleton = () => {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <Navbar />
            <main>
                {/* Cover + Info Section */}
                <div className="container mx-auto px-6 pt-24 pb-8 max-w-7xl">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Cover Skeleton */}
                        <div className="shrink-0 w-full md:w-64 animate-pulse">
                            <div 
                                className="aspect-[2/3] w-full rounded-2xl ring-1 ring-[var(--border)]" 
                                style={{ background: 'var(--bg-secondary)' }}
                            >
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
                        </div>
                        {/* Info Skeleton */}
                        <div className="flex-1 space-y-4 pt-2 animate-pulse">
                            <div className="h-8 w-3/4 rounded-xl" style={{ background: 'var(--bg-secondary)' }} />
                            <div className="h-5 w-1/3 rounded-lg" style={{ background: 'var(--bg-secondary)' }} />
                            <div className="flex gap-2 mt-2">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="h-7 w-20 rounded-full" style={{ background: 'var(--bg-secondary)' }} />
                                ))}
                            </div>
                            <div className="space-y-2 mt-6">
                                <div className="h-4 w-full rounded-lg" style={{ background: 'var(--bg-secondary)' }} />
                                <div className="h-4 w-5/6 rounded-lg" style={{ background: 'var(--bg-secondary)' }} />
                                <div className="h-4 w-4/6 rounded-lg" style={{ background: 'var(--bg-secondary)' }} />
                            </div>
                            <div className="flex gap-3 mt-8">
                                <div className="h-12 w-36 rounded-2xl" style={{ background: 'var(--bg-secondary)' }} />
                                <div className="h-12 w-36 rounded-2xl" style={{ background: 'var(--bg-secondary)' }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chapter List Skeleton */}
                <div className="container mx-auto px-6 py-8 max-w-7xl">
                    <div className="h-7 w-40 rounded-lg mb-6 animate-pulse" style={{ background: 'var(--bg-secondary)' }} />
                    <div className="space-y-3">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div 
                                key={i} 
                                className="flex items-center justify-between p-4 rounded-2xl border animate-pulse"
                                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-5 w-20 rounded-lg" style={{ background: 'var(--bg-primary)' }} />
                                    <div className="h-4 w-40 rounded-lg" style={{ background: 'var(--bg-primary)' }} />
                                </div>
                                <div className="h-4 w-24 rounded-lg" style={{ background: 'var(--bg-primary)' }} />
                            </div>
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ComicInfoSkeleton;
