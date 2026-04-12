import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Layout/Navbar";
import Footer from "../components/Layout/Footer";
import { authService } from "../api/authService";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError("Mật khẩu xác nhận không khớp");
    }
    if (password.length < 6) {
      return setError("Mật khẩu phải có ít nhất 6 ký tự");
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await authService.resetPassword(token, password);
      setMessage(res.message);
      setTimeout(() => navigate("/auth"), 3000);
    } catch (err) {
      setError(err || "Có lỗi xảy ra, vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", padding: "100px 20px" }}>
        <div style={cardStyle}>
          <h2 style={titleStyle}>Đặt lại mật khẩu</h2>
          <p style={subTitleStyle}>Nhập mật khẩu mới cho tài khoản của bạn.</p>
          
          {error && <div style={{ color: "#ef4444", fontSize: "0.9rem", textAlign: "left", marginBottom: "1rem" }}>{error}</div>}
          {message && <div style={{ color: "#22c55e", fontSize: "0.9rem", textAlign: "left", marginBottom: "1rem" }}>{message}</div>}

          {!message && (
            <form style={formStyle} onSubmit={handleSubmit}>
              <input
                type="password"
                placeholder="Mật khẩu mới"
                style={inputStyle}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Xác nhận mật khẩu"
                style={inputStyle}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button type="submit" style={buttonStyle} disabled={loading}>
                {loading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
              </button>
            </form>
          )}
          
          {message && (
            <button onClick={() => navigate("/auth")} style={buttonStyle}>
              Đến trang Đăng nhập
            </button>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

const cardStyle = {
  background: "var(--bg-secondary)",
  padding: "2.5rem",
  borderRadius: "1.5rem",
  width: "100%",
  maxWidth: "420px",
  border: "1px solid var(--border)",
  boxShadow: "var(--shadow-card)",
  textAlign: "center",
};

const titleStyle = { color: "var(--text-primary)", fontSize: "2rem", fontWeight: "800", marginBottom: "0.5rem" };
const subTitleStyle = { color: "var(--text-secondary)", marginBottom: "2rem", fontSize: "0.9rem" };
const formStyle = { display: "flex", flexDirection: "column", gap: "1rem" };
const inputStyle = { width: "100%", boxSizing: "border-box", padding: "0.9rem 1.2rem", borderRadius: "0.8rem", background: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)", outline: "none" };
const buttonStyle = { padding: "1rem", borderRadius: "0.8rem", background: "var(--accent)", color: "white", border: "none", fontWeight: "700", cursor: "pointer", marginTop: "0.5rem", width: "100%" };

export default ResetPassword;
