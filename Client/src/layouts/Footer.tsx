import { Link } from 'react-router-dom';
import { 
    Facebook, 
    Twitter, 
    Instagram, 
    Github,
    Heart,
    Mail,
    Shield,
    Info,
    Clock,
    TrendingUp,
    Grid3X3,
    Trophy
} from 'lucide-react';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    const sections = [
        {
            title: "Khám Phá",
            links: [
                { label: "Thịnh Hành", to: "/popular" },
                { label: "Mới Cập Nhật", to: "/latest" },
                { label: "Thể Loại", to: "/genres" },
            ]
        },
        {
            title: "Hỗ Trợ",
            links: [
                { label: "Về Chúng Tôi", to: "/about" },
                { label: "Liên Hệ", to: "/contact" },
                { label: "Báo Lỗi", to: "/report" },
            ]
        },
        {
            title: "Pháp Lý",
            links: [
                { label: "Điều Khoản", to: "/terms" },
                { label: "Bảo Mật", to: "/privacy" },
                { label: "DMCA", to: "/dmca" },
            ]
        }
    ];

    const socialLinks = [
        { icon: <Facebook size={18} />, href: "#", color: "#1877F2" },
        { icon: <Twitter size={18} />, href: "#", color: "#1DA1F2" },
        { icon: <Instagram size={18} />, href: "#", color: "#E4405F" },
        { icon: <Github size={18} />, href: "#", color: "#333" },
    ];

    return (
        <>
            {/* ── DESKTOP FOOTER ── */}
            <footer className="hidden md:block w-full py-16 border-t" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="flex flex-col lg:flex-row justify-between gap-8 lg:gap-8">
                        
                        {/* Branding */}
                        <div className="flex flex-col gap-4 max-w-sm">
                            <Link to="/" className="inline-block">
                                <h3 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                                    Comic<span style={{ color: 'var(--accent)' }}>Verse</span>
                                </h3>
                            </Link>
                            <p className="text-[0.9rem] leading-relaxed opacity-80" style={{ color: 'var(--text-secondary)' }}>
                                Nền tảng đọc truyện tranh trực tuyến hiện đại. Cung cấp trải nghiệm đọc mượt mà và nội dung chọn lọc hàng đầu.
                            </p>
                            <div className="flex gap-5 mt-2">
                                {socialLinks.map((social, idx) => (
                                    <a 
                                        key={idx} 
                                        href={social.href} 
                                        className="opacity-60 hover:opacity-100 transition-opacity"
                                        style={{ color: 'var(--text-primary)' }}
                                    >
                                        {social.icon}
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Links Grid */}
                        <div className="grid grid-cols-3 gap-12 lg:gap-24">
                            {sections.map((section, idx) => (
                                <div key={idx} className="flex flex-col gap-5">
                                    <h4 className="text-[0.7rem] uppercase tracking-[0.2em] font-bold opacity-60" style={{ color: 'var(--text-primary)' }}>
                                        {section.title}
                                    </h4>
                                    <ul className="flex flex-col gap-3">
                                        {section.links.map((link, lIdx) => (
                                            <li key={lIdx}>
                                                <Link 
                                                    to={link.to} 
                                                    className="text-[0.85rem] font-medium opacity-80 hover:opacity-100 transition-opacity"
                                                    style={{ color: 'var(--text-primary)' }}
                                                >
                                                    {link.label}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t flex justify-between items-center gap-4" style={{ borderColor: 'var(--border)' }}>
                        <p className="text-[0.7rem] uppercase tracking-widest opacity-50" style={{ color: 'var(--text-primary)' }}>
                            © {currentYear} ComicVerse. All rights reserved.
                        </p>
                        <div className="flex items-center gap-4 text-[0.7rem] uppercase tracking-widest opacity-50" style={{ color: 'var(--text-primary)' }}>
                            <Link to="/contact" className="hover:opacity-100 transition-opacity">Liên Hệ</Link>
                            <span className="w-1 h-1 rounded-full bg-current opacity-20"></span>
                            <Link to="/terms" className="hover:opacity-100 transition-opacity">Điều Khoản</Link>
                        </div>
                    </div>
                </div>
            </footer>

            {/* ── MOBILE FOOTER (RE-DESIGNED) ── */}
            <footer className="md:hidden relative overflow-hidden pt-12 pb-8 px-6 border-t border-white/5" style={{ background: 'var(--bg-secondary)' }}>
                {/* Decorative Elements */}
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-pink-500/5 blur-[100px] rounded-full"></div>
                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full"></div>

                <div className="relative z-10 flex flex-col items-center gap-10">
                    {/* Brand Section */}
                    <div className="text-center">
                        <Link to="/" className="inline-block mb-2">
                            <h3 className="text-3xl font-black italic tracking-tighter" style={{ color: 'var(--text-primary)' }}>
                                COMIC<span style={{ color: 'var(--accent)' }}>VERSE</span>
                            </h3>
                        </Link>
                        <p className="text-[0.65rem] opacity-50 uppercase tracking-[0.4em] font-medium" style={{ color: 'var(--text-primary)' }}>
                            Premium Manga Universe
                        </p>
                    </div>

                    {/* Navigation Grid */}
                    <div className="w-full grid grid-cols-2 gap-y-6 gap-x-4">
                        <Link to="/latest" className="mobile-footer-card">
                            <Clock size={16} className="text-blue-400" />
                            <span>Mới Nhất</span>
                        </Link>
                        <Link to="/popular" className="mobile-footer-card">
                            <TrendingUp size={16} className="text-orange-400" />
                            <span>Thịnh Hành</span>
                        </Link>
                        <Link to="/genres" className="mobile-footer-card">
                            <Grid3X3 size={16} className="text-pink-400" />
                            <span>Thể Loại</span>
                        </Link>
                        <Link to="/ranking" className="mobile-footer-card">
                            <Trophy size={16} className="text-yellow-400" />
                            <span>Xếp Hạng</span>
                        </Link>
                    </div>

                    {/* Simple Links */}
                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 opacity-60">
                        <Link to="/about" className="text-[0.75rem] font-semibold flex items-center gap-1.5"><Info size={12}/> Về chúng tôi</Link>
                        <Link to="/contact" className="text-[0.75rem] font-semibold flex items-center gap-1.5"><Mail size={12}/> Liên hệ</Link>
                        <Link to="/privacy" className="text-[0.75rem] font-semibold flex items-center gap-1.5"><Shield size={12}/> Bảo mật</Link>
                    </div>

                    {/* Socials */}
                    <div className="flex gap-6">
                        {socialLinks.map((social, idx) => (
                            <a 
                                key={idx} 
                                href={social.href} 
                                className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 border border-white/5 transition-all active:scale-95"
                                style={{ color: 'var(--text-primary)' }}
                            >
                                {social.icon}
                            </a>
                        ))}
                    </div>

                    {/* Footer Info */}
                    <div className="flex flex-col items-center gap-4 w-full mt-2">
                        <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-30"></div>
                        <p className="text-[0.6rem] opacity-40 uppercase tracking-[0.2em] text-center font-medium" style={{ color: 'var(--text-primary)' }}>
                            © {currentYear} ComicVerse · Crafted with <Heart size={8} fill="currentColor" className="inline mb-0.5" /> in VN
                        </p>
                    </div>
                </div>

                <style>{`
                    .mobile-footer-card {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        padding: 12px 16px;
                        background: rgba(255, 255, 255, 0.03);
                        border: 1px solid rgba(255, 255, 255, 0.05);
                        border-radius: 12px;
                        font-size: 0.8rem;
                        font-weight: 600;
                        color: var(--text-primary);
                        transition: all 0.2s;
                    }
                    .mobile-footer-card:active {
                        background: rgba(255, 255, 255, 0.08);
                        transform: translateY(2px);
                    }
                `}</style>
            </footer>
        </>
    );
};

export default Footer;
