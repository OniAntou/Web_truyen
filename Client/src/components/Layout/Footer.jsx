import React from 'react';
import { Link } from 'react-router-dom';
import { 
    Facebook, 
    Twitter, 
    Instagram, 
    Youtube, 
    Github,
    Mail
} from 'lucide-react';

const Footer = () => {
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
        { icon: <Facebook size={18} />, href: "#" },
        { icon: <Twitter size={18} />, href: "#" },
        { icon: <Instagram size={18} />, href: "#" },
        { icon: <Github size={18} />, href: "#" },
    ];

    return (
        <footer className="w-full py-12 border-t" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="flex flex-col lg:flex-row justify-between gap-10 lg:gap-8">
                    
                    {/* Branding */}
                    <div className="flex flex-col gap-6 max-w-sm">
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
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-12 lg:gap-24">
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

                <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-6" style={{ borderColor: 'var(--border)' }}>
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
    );
};

export default Footer;
