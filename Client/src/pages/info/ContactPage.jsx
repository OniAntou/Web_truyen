import React from 'react';
import { Mail, Share2, Github } from 'lucide-react';
import Navbar from '../../components/Layout/Navbar';
import Footer from '../../components/Layout/Footer';

const ContactPage = () => {
    const contactMethods = [
        {
            icon: <Mail size={24} />,
            label: "Email",
            value: "oniantou@gmail.com",
            description: "Gửi phản hồi hoặc yêu cầu hỗ trợ qua email.",
            link: "mailto:oniantou@gmail.com",
            color: "#f43f5e"
        },
        {
            icon: <Github size={24} />,
            label: "GitHub",
            value: "github.com/OniAntou",
            description: "Xem mã nguồn và đóng góp cho dự án.",
            link: "https://github.com/OniAntou",
            color: "#333"
        }
    ];

    return (
        <div className="contact-page-container">
            <Navbar />
            <main className="contact-content">
                <header className="contact-header">
                    <h1>Liên Hệ Với Chúng Tôi</h1>
                    <p className="subtitle">Đây là một dự án học tập phi thương mại. Mọi thông tin chi tiết hoặc thắc mắc về dự án, vui lòng liên hệ với chúng tôi qua:</p>
                </header>

                <div className="contact-grid">
                    {contactMethods.map((method, idx) => (
                        <a 
                            key={idx} 
                            href={method.link} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="contact-card"
                        >
                            <div className="card-top">
                                <div className="icon-box" style={{ color: method.color, background: `${method.color}15` }}>
                                    {method.icon}
                                </div>
                                <div className="badge">Chính thức</div>
                            </div>
                            <div className="card-info">
                                <h3>{method.label}</h3>
                                <p className="value">{method.value}</p>
                                <p className="desc">{method.description}</p>
                            </div>
                            <div className="card-footer">
                                <span>Kết nối ngay</span>
                                <Share2 size={14} />
                            </div>
                        </a>
                    ))}
                </div>
            </main>
            <Footer />

            <style>{`
                .contact-page-container {
                    min-height: 100vh;
                    background: var(--bg-primary);
                    color: var(--text-primary);
                }
                .contact-content {
                    max-width: 900px;
                    margin: 0 auto;
                    padding: 140px 24px 80px;
                }
                .contact-header {
                    text-align: center;
                    margin-bottom: 60px;
                }
                .contact-header h1 {
                    font-size: 3.5rem;
                    font-weight: 800;
                    margin-bottom: 1rem;
                    background: linear-gradient(to right, #fff, var(--text-secondary));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .contact-header .subtitle {
                    font-size: 1.25rem;
                    color: var(--accent);
                    font-weight: 500;
                    opacity: 0.9;
                }

                .contact-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 32px;
                    margin-bottom: 40px;
                }

                .contact-card {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border);
                    border-radius: 24px;
                    padding: 32px;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                    text-decoration: none;
                }

                .contact-card:hover {
                    transform: translateY(-10px);
                    border-color: var(--accent);
                    box-shadow: 0 20px 40px rgba(244, 63, 94, 0.1);
                }

                .card-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .icon-box {
                    width: 54px;
                    height: 54px;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .badge {
                    font-size: 0.7rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    padding: 4px 10px;
                    border-radius: 99px;
                    background: rgba(255, 255, 255, 0.05);
                    color: var(--text-secondary);
                    border: 1px solid var(--border);
                }

                .card-info h3 {
                    font-size: 1.25rem;
                    font-weight: 700;
                    margin-bottom: 8px;
                    color: var(--text-primary);
                }

                .card-info .value {
                    font-size: 1rem;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin-bottom: 8px;
                    word-break: break-all;
                }

                .card-info .desc {
                    font-size: 0.9rem;
                    color: var(--text-secondary);
                    line-height: 1.5;
                }

                .card-footer {
                    margin-top: auto;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: var(--accent);
                    opacity: 0;
                    transform: translateX(-10px);
                    transition: all 0.3s ease;
                }

                .contact-card:hover .card-footer {
                    opacity: 1;
                    transform: translateX(0);
                }

                @media (max-width: 768px) {
                    .contact-header h1 {
                        font-size: 2.5rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default ContactPage;
