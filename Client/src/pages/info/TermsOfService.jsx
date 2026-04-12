import React from "react";
import Navbar from "../../components/Layout/Navbar";
import Footer from "../../components/Layout/Footer";

const TermsOfService = () => {
  return (
    <div className="info-page-container">
      <Navbar />
      <main className="info-content">
        <h1>Điều khoản Sử dụng</h1>
        <p className="last-updated">Cập nhật lần cuối: 12 tháng 4, 2026</p>

        <section className="legal-section">
          <h2>1. Chấp nhận Điều khoản</h2>
          <p>
            Bằng cách truy cập và sử dụng dịch vụ tại ComicVerse, bạn đồng ý tuân thủ các điều khoản và điều kiện được nêu tại đây. Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, vui lòng không sử dụng dịch vụ của chúng tôi.
          </p>
        </section>

        <section className="legal-section">
          <h2>2. Tài khoản Người dùng</h2>
          <p>
            Bạn có trách nhiệm bảo mật thông tin tài khoản và mật khẩu của mình. Bạn đồng ý chịu trách nhiệm cho tất cả các hoạt động xảy ra dưới tài khoản của mình. Chúng tôi có quyền tạm ngừng hoặc chấm dứt tài khoản nếu phát hiện bất kỳ hoạt động vi phạm pháp luật hoặc quy định của trang web.
          </p>
        </section>

        <section className="legal-section">
          <h2>3. Nội dung và Bản quyền</h2>
          <p>
            Tất cả nội dung trên ComicVerse (bao gồm truyện tranh, hình ảnh, mã nguồn) đều là tài sản của chúng tôi hoặc các đối tác cấp phép. Bạn không được phép sao chép, phân phối hoặc sử dụng lại cho mục đích thương mại khi chưa có sự cho phép bằng văn bản.
          </p>
        </section>

        <section className="legal-section">
          <h2>4. Hệ thống Xu và Thanh toán</h2>
          <p>
            Xu được mua thông qua hệ thống nạp tiền và được sử dụng để mở khoá các chương truyện có phí. 
            - Xu không có giá trị quy đổi ngược lại thành tiền mặt.
            - Các giao dịch nạp tiền thành công sẽ không được hoàn trả dưới bất kỳ hình thức nào, trừ trường hợp lỗi kỹ thuật từ phía hệ thống của chúng tôi.
          </p>
        </section>

        <section className="legal-section">
          <h2>5. Hành vi Cấm</h2>
          <ul>
            <li>Sử dụng các công cụ tự động để thu thập dữ liệu (scraping).</li>
            <li>Đăng tải nội dung đồi trụy, thù địch hoặc vi phạm pháp luật trong phần bình luận.</li>
            <li>Gây gián đoạn hoạt động của máy chủ hoặc hạ tầng mạng của ComicVerse.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>6. Thay đổi Điều khoản</h2>
          <p>
            Chúng tôi có quyền sửa đổi các điều khoản này bất kỳ lúc nào. Những thay đổi sẽ có hiệu lực ngay khi được đăng tải trên website. Việc bạn tiếp tục sử dụng dịch vụ sau khi có thay đổi đồng nghĩa với việc bạn chấp nhận các điều khoản mới.
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
          max-width: 800px;
          margin: 0 auto;
          padding: 120px 24px 80px;
        }
        .info-content h1 {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }
        .last-updated {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin-bottom: 3rem;
        }
        .legal-section {
          margin-bottom: 40px;
        }
        .legal-section h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: var(--accent);
        }
        .legal-section p, .legal-section li {
          color: var(--text-secondary);
          line-height: 1.7;
          margin-bottom: 1rem;
        }
        .legal-section ul {
          padding-left: 1.5rem;
        }
      `}</style>
    </div>
  );
};

export default TermsOfService;
