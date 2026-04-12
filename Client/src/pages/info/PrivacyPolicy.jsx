import React from "react";
import Navbar from "../../components/Layout/Navbar";
import Footer from "../../components/Layout/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="info-page-container">
      <Navbar />
      <main className="info-content">
        <h1>Chính sách Bảo mật</h1>
        <p className="last-updated">Cập nhật lần cuối: 12 tháng 4, 2026</p>

        <section className="legal-section">
          <h2>1. Thông tin chúng tôi thu thập</h2>
          <p>Chúng tôi có thể thu thập các loại thông tin sau:</p>
          <ul>
            <li><strong>Thông tin tài khoản:</strong> Tên người dùng, email, mật khẩu (được mã hoá) khi bạn đăng ký.</li>
            <li><strong>Thông tin sử dụng:</strong> Lịch sử đọc truyện, danh sách theo dõi, bình luận và đánh giá của bạn.</li>
            <li><strong>Thông tin nạp tiền:</strong> Chúng tôi ghi nhận lịch sử giao dịch nhưng KHÔNG lưu trữ thông tin thẻ thanh toán (thông tin này được xử lý bởi các cổng thanh toán như VNPay).</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>2. Cách chúng tôi sử dụng thông tin</h2>
          <p>Thông tin thu thập được sử dụng cho các mục đích:</p>
          <ul>
            <li>Cung cấp và duy trì trải nghiệm đọc truyện được cá nhân hoá.</li>
            <li>Xử lý các giao dịch nạp xu và mở khoá chương.</li>
            <li>Gửi thông báo về cập nhật truyện mới hoặc khôi phục mật khẩu.</li>
            <li>Cải thiện chất lượng dịch vụ và bảo mật hệ thống.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>3. Bảo mật Thông tin</h2>
          <p>
            Chúng tôi áp dụng các biện pháp bảo mật tiêu chuẩn ngành (bao gồm mã hoá SSL và mật khẩu băm) để bảo vệ dữ liệu khỏi sự truy cập không trái phép. Tuy nhiên, không có phương thức truyền tải qua Internet nào là an toàn 100%, do đó chúng tôi không thể đảm bảo một cách tuyệt đối.
          </p>
        </section>

        <section className="legal-section">
          <h2>4. Chia sẻ với bên thứ ba</h2>
          <p>
            ComicVerse không bán hoặc chia sẻ thông tin cá nhân của bạn cho bên thứ ba vì mục đích tiếp thị. Chúng tôi chỉ chia sẻ thông tin trong trường hợp:
            - Theo yêu cầu của cơ quan pháp luật có thẩm quyền.
            - Với các đối tác cung cấp dịch vụ thiết yếu (như cổng thanh toán) để hoàn thành giao dịch.
          </p>
        </section>

        <section className="legal-section">
          <h2>5. Quyền của bạn</h2>
          <p>
            Bạn có quyền truy cập, chỉnh sửa hoặc yêu cầu xoá thông tin cá nhân của mình trong phần cài đặt hồ sơ. Nếu bạn có bất kỳ thắc mắc nào về dữ liệu của mình, vui lòng liên hệ với bộ phận hỗ trợ của chúng tôi.
          </p>
        </section>

        <section className="legal-section">
          <h2>6. Cookies</h2>
          <p>
            Chúng tôi sử dụng cookies để lưu trữ phiên đăng nhập và ghi nhớ tuỳ chỉnh của bạn. Bạn có thể chọn tắt cookies trong cài đặt trình duyệt, nhưng điều này có thể ảnh hưởng đến một số tính năng của website.
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

export default PrivacyPolicy;
