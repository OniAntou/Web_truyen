import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Layout/Navbar";
import Footer from "../components/Layout/Footer";
import { authService } from "../api/authService";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const registerSchema = z.object({
  username: z.string().min(3, "Tên hiển thị phải có ít nhất 3 ký tự").max(50, "Tên hiển thị quá dài"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ").min(1, "Vui lòng nhập email"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const navigate = useNavigate();

  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(isLogin ? loginSchema : registerSchema),
    mode: "onBlur"
  });

  const onSubmit = async (data) => {
    setApiError("");
    setLoading(true);
    try {
      const response = isLogin 
        ? await authService.login(data.email, data.password)
        : await authService.register(data.username, data.email, data.password);
        
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      navigate("/");
    } catch (err) {
      setApiError(err.message || err);
    } finally {
      setLoading(false);
    }
  };

  const toggleLogin = () => {
    setIsLogin(!isLogin);
    setIsForgotPassword(false);
    reset();
    setApiError("");
    setForgotMessage("");
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotLoading(true);
    setForgotMessage('');
    setApiError('');
    try {
      const res = await authService.forgotPassword(forgotEmail);
      setForgotMessage(res.message || 'Đã gửi hướng dẫn đặt lại mật khẩu.');
    } catch (err) {
      setApiError(err.message || err);
    } finally {
      setForgotLoading(false);
    }
  };

  const renderForm = () => {
    if (isForgotPassword) {
      return (
        <>
          <h2 style={titleStyle}>Khôi phục mật khẩu</h2>
          <p style={subTitleStyle}>Nhập email của bạn để nhận hướng dẫn thay đổi mật khẩu mới.</p>
          {apiError && <div style={{ color: "#ef4444", fontSize: "0.9rem", textAlign: "left", marginBottom: "0.5rem" }}>{apiError}</div>}
          {forgotMessage && <div style={{ color: "#22c55e", fontSize: "0.9rem", textAlign: "left", marginBottom: "0.5rem" }}>{forgotMessage}</div>}
          <form style={formStyle} onSubmit={handleForgotPassword}>
            <input
              type="email"
              placeholder="Email khôi phục"
              style={inputStyle}
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              required
            />
            <button type="submit" style={buttonStyle} disabled={forgotLoading}>
              {forgotLoading ? "Đang gửi..." : "Gửi yêu cầu"}
            </button>
          </form>
          <button onClick={() => { setIsForgotPassword(false); setApiError(''); setForgotMessage(''); }} style={linkBtnStyle}>
            Quay lại Đăng nhập
          </button>
        </>
      );
    }

    return (
      <>
        <h2 style={titleStyle}>{isLogin ? "ComicVerse" : "Gia Nhập Verse"}</h2>
        <p style={subTitleStyle}>{isLogin ? "Đăng nhập để theo dõi truyện yêu thích" : "Tạo tài khoản để trải nghiệm tốt hơn"}</p>

        <form style={formStyle} onSubmit={handleSubmit(onSubmit)}>
          {apiError && <div style={{ color: "#ef4444", fontSize: "0.9rem", textAlign: "left" }}>{apiError}</div>}
          
          {!isLogin && (
            <div style={{ textAlign: "left" }}>
              <input type="text" placeholder="Tên hiển thị" style={inputStyle} {...register("username")} />
              {errors.username && <span style={{ color: "#ef4444", fontSize: "0.8rem", display: "block", marginTop: "4px" }}>{errors.username.message}</span>}
            </div>
          )}
          
          <div style={{ textAlign: "left" }}>
            <input type="email" placeholder="Email của bạn" style={inputStyle} {...register("email")} />
            {errors.email && <span style={{ color: "#ef4444", fontSize: "0.8rem", display: "block", marginTop: "4px" }}>{errors.email.message}</span>}
          </div>

          <div style={{ textAlign: "left" }}>
            <input type="password" placeholder="Mật khẩu" style={inputStyle} {...register("password")} />
            {errors.password && <span style={{ color: "#ef4444", fontSize: "0.8rem", display: "block", marginTop: "4px" }}>{errors.password.message}</span>}
          </div>

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
            onClick={toggleLogin}
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
const inputStyle = { width: "100%", boxSizing: "border-box", padding: "0.9rem 1.2rem", borderRadius: "0.8rem", background: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)", outline: "none" };
const buttonStyle = { padding: "1rem", borderRadius: "0.8rem", background: "var(--accent)", color: "white", border: "none", fontWeight: "700", cursor: "pointer", marginTop: "0.5rem" };
const linkBtnStyle = { background: "none", border: "none", color: "var(--accent)", fontWeight: "bold", marginLeft: "0.5rem", cursor: "pointer", textDecoration: "underline" };

export default AuthPage;
