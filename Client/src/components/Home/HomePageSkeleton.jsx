import React from 'react';
import Navbar from '../Layout/Navbar';
import Footer from '../Layout/Footer';
import SkeletonCard from '../ui/SkeletonCard';

const HomePageSkeleton = () => {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <Navbar />
            <main>
                {/* Hero Skeleton */}
                <div className="relative w-full overflow-hidden" style={{ height: '70vh', minHeight: '500px' }}>
                    <div className="absolute inset-0 animate-pulse" style={{ background: 'var(--bg-secondary)' }}>
                        <div 
                            className="absolute inset-0" 
                            style={{
                                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.03) 50%, transparent 100%)',
                                animation: 'shimmer 2s infinite'
                            }}
                        />
                    </div>
                    {/* Fake hero content overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
                        <div className="max-w-7xl mx-auto">
                            <div className="h-4 w-24 rounded-full mb-4 animate-pulse" style={{ background: 'rgba(255,255,255,0.1)' }} />
                            <div className="h-10 w-80 rounded-xl mb-3 animate-pulse" style={{ background: 'rgba(255,255,255,0.08)' }} />
                            <div className="h-4 w-96 rounded-lg mb-6 animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
                            <div className="flex gap-3">
                                <div className="h-12 w-36 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.1)' }} />
                                <div className="h-12 w-36 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trending Skeleton */}
                <div className="container mx-auto px-6 py-8 md:py-12 max-w-7xl">
                    <div className="rounded-[2rem] p-6 md:p-8 shadow-sm flex flex-col xl:flex-row gap-6 xl:items-center" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                        <div className="shrink-0 xl:w-32 xl:border-r xl:pr-6" style={{ borderColor: 'var(--border)' }}>
                            <div className="h-6 w-12 rounded-lg mb-1 animate-pulse" style={{ background: 'var(--bg-primary)' }} />
                            <div className="h-7 w-16 rounded-lg animate-pulse" style={{ background: 'var(--accent)', opacity: 0.3 }} />
                        </div>
                        <div className="flex-1 flex gap-5 overflow-hidden">
                            {Array.from({ length: 7 }).map((_, i) => (
                                <div key={i} className="shrink-0 w-28 md:w-36 flex flex-col gap-3 animate-pulse">
                                    <div className="aspect-[2/3] w-full rounded-2xl ring-1 ring-[var(--border)]" style={{ background: 'var(--bg-primary)' }} />
                                    <div className="h-3 w-3/4 rounded-lg" style={{ background: 'var(--bg-primary)' }} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Comic Grid Skeleton x2 */}
                {[1, 2].map(section => (
                    <section key={section} className="container mx-auto px-6 py-12 md:py-16 max-w-7xl">
                        <div className="flex items-end justify-between mb-8 md:mb-10">
                            <div className="h-9 w-56 rounded-xl animate-pulse" style={{ background: 'var(--bg-secondary)' }} />
                            <div className="h-4 w-20 rounded animate-pulse" style={{ background: 'var(--bg-secondary)' }} />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 md:gap-x-6 md:gap-y-10">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <SkeletonCard key={i} />
                            ))}
                        </div>
                    </section>
                ))}
            </main>
            <Footer />
        </div>
    );
};

export default HomePageSkeleton;
