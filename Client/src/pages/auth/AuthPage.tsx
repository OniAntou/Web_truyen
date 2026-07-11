import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { authService } from "../../services/authService";
import { useAuthStore } from "../../store/authStore";
import { clearAuthToken } from "../../utils/authToken";
import { useTranslation } from "../../hooks/useTranslation";

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(50, "Username too long"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email").min(1, "Please enter email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

interface AuthForm {
  username?: string;
  email: string;
  password: string;
}

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const navigate = useNavigate();
  const { login: storeLogin } = useAuthStore();
  const { t } = useTranslation();

  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<AuthForm>({
    resolver: zodResolver(isLogin ? loginSchema : registerSchema),
    mode: "onBlur"
  });

  const onSubmit = async (data: AuthForm) => {
    setApiError("");
    setLoading(true);
    try {
      const response = isLogin 
        ? await authService.login(data.email, data.password)
        : await authService.register(data.username!, data.email, data.password);
        
      clearAuthToken();
      storeLogin(response.user);
      navigate("/");
    } catch (err: any) {
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotLoading(true);
    setForgotMessage('');
    setApiError('');
    try {
      const res = await authService.forgotPassword(forgotEmail);
      setForgotMessage(res.message || t('success'));
    } catch (err: any) {
      setApiError(err.message || err);
    } finally {
      setForgotLoading(false);
    }
  };

  const renderForm = () => {
    if (isForgotPassword) {
      return (
        <div className="flex flex-col gap-6">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white mb-2">{t('forgot_password_title')}</h2>
            <p className="text-zinc-400 text-sm">{t('forgot_password_subtitle')}</p>
          </div>
          
          {apiError && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">{apiError}</div>}
          {forgotMessage && <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-sm">{forgotMessage}</div>}
          
          <form className="flex flex-col gap-4" onSubmit={handleForgotPassword}>
            <input
              type="email"
              placeholder={t('email_placeholder')}
              className="w-full px-4 py-3 rounded-xl bg-black border border-zinc-800 text-white outline-none focus:border-rose-500 transition-colors"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              required
            />
            <button 
                type="submit" 
                className="w-full py-3.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold transition-all disabled:opacity-50"
                disabled={forgotLoading}
            >
              {forgotLoading ? t('sending') : t('send_request')}
            </button>
          </form>
          
          <button 
            onClick={() => { setIsForgotPassword(false); setApiError(''); setForgotMessage(''); }} 
            className="text-rose-500 font-semibold hover:underline text-sm"
          >
            {t('back_to_login')}
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <h2 className="text-4xl font-black text-white mb-2">{isLogin ? t('login_title') : t('register_title')}</h2>
          <p className="text-zinc-400 text-sm">{isLogin ? t('login_subtitle') : t('register_subtitle')}</p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          {apiError && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">{apiError}</div>}
          
          {!isLogin && (
            <div className="flex flex-col gap-1">
              <input 
                type="text" 
                placeholder={t('display_name_placeholder')} 
                className="w-full px-4 py-3 rounded-xl bg-black border border-zinc-800 text-white outline-none focus:border-rose-500 transition-colors" 
                {...register("username")} 
              />
              {errors.username && <span className="text-red-500 text-xs px-1">{errors.username.message}</span>}
            </div>
          )}
          
          <div className="flex flex-col gap-1">
            <input 
                type="email" 
                placeholder={t('email_placeholder')} 
                className="w-full px-4 py-3 rounded-xl bg-black border border-zinc-800 text-white outline-none focus:border-rose-500 transition-colors" 
                {...register("email")} 
            />
            {errors.email && <span className="text-red-500 text-xs px-1">{errors.email.message}</span>}
          </div>

          <div className="flex flex-col gap-1">
            <input 
                type="password" 
                placeholder={t('password_placeholder')} 
                className="w-full px-4 py-3 rounded-xl bg-black border border-zinc-800 text-white outline-none focus:border-rose-500 transition-colors" 
                {...register("password")} 
            />
            {errors.password && <span className="text-red-500 text-xs px-1">{errors.password.message}</span>}
          </div>

          {isLogin && (
            <div className="text-right -mt-2">
              <button 
                type="button" 
                onClick={() => setIsForgotPassword(true)} 
                className="text-xs text-zinc-500 hover:text-rose-500 transition-colors"
              >
                {t('forgot_password_link')}
              </button>
            </div>
          )}

          <button 
            type="submit" 
            className="w-full py-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-lg shadow-lg shadow-rose-500/20 transition-all disabled:opacity-50"
            disabled={loading}
          >
            {loading ? t('processing') : (isLogin ? t('login_btn') : t('register_btn'))}
          </button>
        </form>

        <div className="text-center pt-2">
          <span className="text-zinc-500 text-sm">{isLogin ? t('new_to_verse') : t('already_have_account')}</span>
          <button
            onClick={toggleLogin}
            className="ml-2 text-rose-500 font-bold hover:underline"
          >
            {isLogin ? t('register_title') : t('login')}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-[440px] p-8 md:p-10 rounded-[2rem] bg-zinc-900 border border-zinc-800 shadow-2xl">
        {renderForm()}
      </div>
    </div>
  );
};

export default AuthPage;
