import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Layout/Navbar";
import Footer from "../components/Layout/Footer";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const body = isLogin ? { email, password } : { username, email, password };
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Đã xảy ra lỗi");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => {
    if (isForgotPassword) {
      return (
        <>
          <h2 style={titleStyle}>Khôi phục mật khẩu</h2>
          <p style={subTitleStyle}>Nhập email của bạn để nhận hướng dẫn thay đổi mật khẩu mới.</p>
          <form style={formStyle}>
            <input type="email" placeholder="Email khôi phục" style={inputStyle} />
            <button type="button" style={buttonStyle}>
              Gửi yêu cầu
            </button>
          </form>
          <button onClick={() => setIsForgotPassword(false)} style={linkBtnStyle}>
            Quay lại Đăng nhập
          </button>
        </>
      );
    }

    return (
      <>
        <h2 style={titleStyle}>{isLogin ? "ComicVerse" : "Gia Nhập Verse"}</h2>
        <p style={subTitleStyle}>{isLogin ? "Đăng nhập để theo dõi truyện yêu thích" : "Tạo tài khoản để trải nghiệm tốt hơn"}</p>

        <form style={formStyle} onSubmit={handleSubmit}>
          {error && <div style={{ color: "#ef4444", fontSize: "0.9rem", textAlign: "left" }}>{error}</div>}
          {!isLogin && <input type="text" placeholder="Tên hiển thị" style={inputStyle} value={username} onChange={(e) => setUsername(e.target.value)} required />}
          <input type="email" placeholder="Email của bạn" style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Mật khẩu" style={inputStyle} value={password} onChange={(e) => setPassword(e.target.value)} required />

          {/* Nút Quên mật khẩu nằm ở đây */}
          {isLogin && (
            <div style={{ textAlign: "right", marginTop: "-0.5rem" }}>
              <button type="button" onClick={() => setIsForgotPassword(true)} style={{ ...linkBtnStyle, fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                Quên mật khẩu?
              </button>
            </div>
          )}

          <button type="submit" style={buttonStyle} disabled={loading}>
            {loading ? "Đang xử lý..." : (isLogin ? "Đăng Nhập" : "Đăng Ký Ngay")}
          </button>
        </form>

        <div style={{ marginTop: "1.5rem" }}>
          <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>{isLogin ? "Bạn mới biết đến ComicVerse?" : "Đã có tài khoản rồi?"}</span>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setIsForgotPassword(false);
            }}
            style={linkBtnStyle}
          >
            {isLogin ? "Tạo tài khoản" : "Đăng nhập"}
          </button>
        </div>
      </>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", padding: "100px 20px" }}>
        <div style={cardStyle}>{renderForm()}</div>
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
const inputStyle = { padding: "0.9rem 1.2rem", borderRadius: "0.8rem", background: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)", outline: "none" };
const buttonStyle = { padding: "1rem", borderRadius: "0.8rem", background: "var(--accent)", color: "white", border: "none", fontWeight: "700", cursor: "pointer", marginTop: "0.5rem" };
const linkBtnStyle = { background: "none", border: "none", color: "var(--accent)", fontWeight: "bold", marginLeft: "0.5rem", cursor: "pointer", textDecoration: "underline" };

export default AuthPage;
