import React from "react";
import { Info } from "lucide-react";
import Navbar from "../../components/Layout/Navbar";
import Footer from "../../components/Layout/Footer";

const AboutPage = () => {
  return (
    <div className="info-page-container">
      <Navbar />
      <main className="info-content">
        <section className="info-hero">
          <h1>Chào mừng đến với ComicVerse</h1>
          <p className="subtitle">Nơi hội tụ đam mê truyện tranh</p>
        </section>

        <section className="info-section">
          <h2>Tầm nhìn của chúng tôi</h2>
          <p>
            ComicVerse được xây dựng với mục tiêu trở thành nền tảng đọc truyện tranh kỹ thuật số hàng đầu, 
            nơi kết nối giữa độc giả và những tác giả sáng tạo. Chúng tôi tin rằng mỗi câu chuyện đều có 
            quầng sáng riêng và xứng đáng được lan toả tới mọi người.
          </p>
        </section>

        <section className="info-section">
          <h2>Tại sao chọn ComicVerse?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>Trải nghiệm cao cấp</h3>
              <p>Giao diện hiện đại, mượt mà và tối ưu trên mọi thiết bị di động.</p>
            </div>
            <div className="feature-card">
              <h3>Cập nhật liên tục</h3>
              <p>Những chương mới nhất được cập nhật mỗi giây, đảm bảo bạn không bỏ lỡ bất kỳ diễn biến nào.</p>
            </div>
            <div className="feature-card">
              <h3>Cộng đồng gắn kết</h3>
              <p>Hệ thống bình luận, thảo luận và đánh giá giúp bạn chia sẻ cảm xúc với hàng ngàn độc giả khác.</p>
            </div>
          </div>
        </section>

        <section className="info-section text-center">
          <h2>Sẵn sàng bắt đầu?</h2>
          <p>Hành trình khám phá vũ trụ truyện tranh đang chờ đón bạn.</p>
          <a href="/" className="cta-button">Khám phá ngay</a>
        </section>

        <section className="info-section">
          <h2>Thông tin dự án</h2>
          <p>
            ComicVerse là một sản phẩm đồ án kỹ thuật phi thương mại, được phát triển nhằm mục đích nghiên cứu công nghệ và trình diễn kỹ năng lập trình. 
            Mọi dữ liệu trên nền tảng chỉ được sử dụng cho mục đích học thuật và thử nghiệm.
          </p>
        </section>
      </main>
      <Footer />

      <style>{`
        .info-page-container {
          min-height: 100vh;
          background: var(--bg-primary);
          color: var(--text-primary);
        }
        .info-content {
          max-width: 900px;
          margin: 0 auto;
          padding: 120px 24px 80px;
        }
        .info-hero {
          text-align: center;
          margin-bottom: 60px;
        }
        .info-hero h1 {
          font-size: 3.5rem;
          font-weight: 800;
          background: linear-gradient(to right, #fff, #a1a1aa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 1rem;
        }
        .subtitle {
          font-size: 1.25rem;
          color: var(--accent);
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        .info-section {
          margin-bottom: 80px;
        }
        .info-section h2:not(.professional-title) {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          color: var(--text-primary);
          border-left: 4px solid var(--accent);
          padding-left: 1rem;
        }
        .info-section p:not(.professional-text) {
          color: var(--text-secondary);
          line-height: 1.8;
          font-size: 1.1rem;
        }

        /* Professional Card Design */
        .professional-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 32px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          transition: border-color 0.3s ease;
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .badge-status {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.05);
          padding: 6px 14px;
          border-radius: 99px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-secondary);
          border: 1px solid var(--border);
        }
        .badge-status .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--accent);
          box-shadow: 0 0 10px var(--accent);
        }
        .info-icon-subtle {
          color: var(--text-secondary);
          opacity: 0.4;
        }
        .professional-title {
          font-size: 1.5rem;
          font-weight: 800;
          margin-bottom: 16px;
          color: var(--text-primary);
        }
        .professional-divider {
          width: 40px;
          height: 4px;
          background: var(--accent);
          margin-bottom: 24px;
          border-radius: 2px;
        }
        .professional-text {
          font-size: 1rem;
          line-height: 1.6;
          color: var(--text-secondary);
          margin-bottom: 24px;
        }
        .professional-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 20px;
          padding-top: 24px;
          border-top: 1px solid var(--border);
        }
        .grid-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .grid-item .label {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-secondary);
          opacity: 0.6;
        }
        .grid-item .value {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        @media (max-width: 640px) {
          .professional-card {
            padding: 30px 20px;
          }
          .professional-title {
            font-size: 1.5rem;
          }
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 24px;
          margin-top: 40px;
        }
        .feature-card {
          background: var(--bg-secondary);
          padding: 32px;
          border-radius: 20px;
          border: 1px solid var(--border);
          transition: transform 0.3s ease;
        }
        .feature-card:hover {
          transform: translateY(-5px);
          border-color: var(--accent-hover);
        }
        .feature-card h3 {
          color: var(--text-primary);
          margin-bottom: 1rem;
          font-size: 1.25rem;
        }
        .feature-card p {
          font-size: 0.95rem;
        }
        .text-center { text-align: center; }
        .cta-button {
          display: inline-block;
          margin-top: 2rem;
          padding: 16px 40px;
          background: var(--accent);
          color: white;
          border-radius: 12px;
          font-weight: 700;
          text-decoration: none;
          transition: opacity 0.3s;
        }
        .cta-button:hover { opacity: 0.9; }
      `}</style>
    </div>
  );
};

export default AboutPage;
