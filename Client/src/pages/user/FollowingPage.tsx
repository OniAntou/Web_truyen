import { useState, useEffect } from 'react';


import ComicGrid from '../../features/home/ComicGrid';
import { BookMarked } from 'lucide-react';
import { comicService } from '../../services/comicService';
import { Comic } from '../../types/comic';

const FollowingPage: React.FC = () => {
    const [comics, setComics] = useState<Comic[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        
        comicService.getUserFavorites()
            .then(data => {
                setComics(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError(err.message);
                setLoading(false);
            });
    }, []);

    if (loading) return <div style={{ paddingTop: '8rem', textAlign: 'center', minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>Loading...</div>;
    if (error) return <div style={{ paddingTop: '8rem', textAlign: 'center', minHeight: '100vh', background: 'var(--bg-primary)', color: '#ef4444' }}>Error: {error}</div>;

    return (
        <div className="page-wrapper" style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
            
            <main className="main-content" style={{ paddingTop: '7rem', paddingBottom: '4rem' }}>
                <section className="container section">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                        <BookMarked size={28} color="#eab308" />
                        <h2 className="section-title" style={{ margin: 0 }}>Truyện Đang Theo Dõi</h2>
                    </div>

                    {comics.length > 0 ? (
                        <ComicGrid title="" comics={comics} hideTitle={true} />
                    ) : (
                        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--bg-secondary)', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
                            <p style={{ color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: 'bold' }}>Tủ truyện của bạn đang trống.</p>
                            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Hãy khám phá và thả tim "Favorite" cho những bộ truyện mà bạn yêu thích nhé!</p>
                        </div>
                    )}
                </section>
            </main>
            
        </div>
    );
};

export default FollowingPage;
