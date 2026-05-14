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
    Trophy,
    Languages
} from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();
    const { t, language, toggleLanguage } = useTranslation();

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
                            <span className="w-1 h-1 rounded-full bg-current opacity-20"></span>
                            <button 
                                onClick={toggleLanguage} 
                                className="flex items-center gap-1.5 hover:opacity-100 transition-opacity uppercase font-bold"
                                title={t('switch_lang')}
                            >
                                <Languages size={14} />
                                <span>{language}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </footer>

            <footer className="md:hidden pt-12 pb-12 px-6 border-t" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border)' }}>
                <div className="container mx-auto">
                    <div className="flex flex-col gap-12">
                        {/* Brand & Mission */}
                        <div className="space-y-4">
                            <Link to="/" className="inline-block">
                                <h3 className="text-2xl font-black tracking-tighter" style={{ color: 'var(--text-primary)' }}>
                                    COMIC<span style={{ color: 'var(--accent)' }}>VERSE</span>
                                </h3>
                            </Link>
                            <p className="text-sm leading-relaxed opacity-70" style={{ color: 'var(--text-secondary)' }}>
                                Nền tảng đọc truyện tranh trực tuyến hiện đại. Nơi hội tụ những bộ truyện đỉnh cao và trải nghiệm đọc mượt mà nhất.
                            </p>
                        </div>

                        {/* Navigation Groups */}
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h4 className="text-[0.65rem] font-bold uppercase tracking-[0.2em] opacity-40" style={{ color: 'var(--text-primary)' }}>Khám phá</h4>
                                <ul className="space-y-3">
                                    <li><Link to="/latest" className="text-sm font-medium opacity-80" style={{ color: 'var(--text-primary)' }}>Mới Cập Nhật</Link></li>
                                    <li><Link to="/popular" className="text-sm font-medium opacity-80" style={{ color: 'var(--text-primary)' }}>Thịnh Hành</Link></li>
                                    <li><Link to="/genres" className="text-sm font-medium opacity-80" style={{ color: 'var(--text-primary)' }}>Thể Loại</Link></li>
                                    <li><Link to="/ranking" className="text-sm font-medium opacity-80" style={{ color: 'var(--text-primary)' }}>Xếp Hạng</Link></li>
                                </ul>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-[0.65rem] font-bold uppercase tracking-[0.2em] opacity-40" style={{ color: 'var(--text-primary)' }}>Thông tin</h4>
                                <ul className="space-y-3">
                                    <li><Link to="/about" className="text-sm font-medium opacity-80" style={{ color: 'var(--text-primary)' }}>Về Chúng Tôi</Link></li>
                                    <li><Link to="/contact" className="text-sm font-medium opacity-80" style={{ color: 'var(--text-primary)' }}>Liên Hệ</Link></li>
                                    <li><Link to="/privacy" className="text-sm font-medium opacity-80" style={{ color: 'var(--text-primary)' }}>Bảo Mật</Link></li>
                                    <li><Link to="/terms" className="text-sm font-medium opacity-80" style={{ color: 'var(--text-primary)' }}>Điều Khoản</Link></li>
                                </ul>
                            </div>
                        </div>

                        {/* Social & Language */}
                        <div className="flex flex-col gap-6 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
                            <div className="flex items-center justify-between">
                                <div className="flex gap-4">
                                    {socialLinks.map((social, idx) => (
                                        <a 
                                            key={idx} 
                                            href={social.href} 
                                            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90"
                                            style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                                        >
                                            {social.icon}
                                        </a>
                                    ))}
                                </div>
                                <button 
                                    onClick={toggleLanguage} 
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-[0.7rem] font-bold uppercase tracking-widest transition-all active:scale-95"
                                    style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                                >
                                    <Languages size={14} />
                                    <span>{language}</span>
                                </button>
                            </div>
                            
                            <div className="flex flex-col gap-2">
                                <p className="text-[0.65rem] opacity-40 font-medium" style={{ color: 'var(--text-primary)' }}>
                                    © {currentYear} ComicVerse. Bản quyền thuộc về đội ngũ phát triển.
                                </p>
                                <p className="text-[0.65rem] opacity-30 italic" style={{ color: 'var(--text-primary)' }}>
                                    Made with passion for the manga community.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
};

export default Footer;
