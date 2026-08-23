import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, BookOpen } from 'lucide-react';
import apiClient from '../../services/apiClient';
import { clearAdminToken } from '../../utils/authToken';

const AdminLogin = () => {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Nếu đã đăng nhập thì redirect luôn về dashboard
    useEffect(() => {
        const hasAdmin = localStorage.getItem('admin');
        if (hasAdmin) {
            navigate('/admin', { replace: true });
        }
    }, [navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!username || !password) {
            setError('Vui lòng nhập đầy đủ thông tin');
            setLoading(false);
            return;
        }

        try {
            const data = await apiClient<{ admin: any }>('/admin/login', {
                body: { username, password },
                skipAuthLogout: true,
            });

            clearAdminToken();
            localStorage.setItem('admin', JSON.stringify(data.admin));
            navigate('/admin', { replace: true });
        } catch (err: any) {
            console.error(err);
            setError(err?.message || 'Sai tên đăng nhập hoặc mật khẩu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 font-sans selection:bg-white/20 relative">
            <div className="w-full max-w-[380px] relative z-10">
                {/* Header */}
                <div className="flex flex-col items-center mb-10">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                        <BookOpen strokeWidth={1.5} size={22} className="text-black" />
                    </div>
                    <h1 className="text-2xl font-medium text-white tracking-tight">SkyComic</h1>
                    <p className="text-zinc-300 text-sm mt-1.5 font-medium tracking-wide uppercase">Admin Portal</p>
                </div>

                {/* Form Wrapper */}
                <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800 shadow-xl relative">
                    <form onSubmit={handleSubmit} className="space-y-6 relative">
                        {/* Username */}
                        <div>
                            <label className="block text-[0.7rem] font-semibold text-zinc-200 uppercase tracking-widest mb-2 ml-1">
                                Username
                            </label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={loading}
                                placeholder="Enter admin username"
                                autoComplete="username"
                                className="w-full bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-zinc-500 transition-colors disabled:opacity-50"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-[0.7rem] font-semibold text-zinc-200 uppercase tracking-widest mb-2 ml-1">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading}
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    className="w-full bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 rounded-xl px-4 py-3.5 pr-11 text-sm outline-none focus:border-zinc-500 transition-colors disabled:opacity-50"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-white transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff strokeWidth={1.5} size={18} /> : <Eye strokeWidth={1.5} size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm animate-fade-in">
                                <span className="shrink-0 text-red-500">⚠</span>
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 disabled:bg-zinc-400 disabled:opacity-60 text-black font-semibold py-3.5 rounded-xl transition-colors mt-2 cursor-pointer disabled:cursor-not-allowed shadow-sm"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-black" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                    <span className="text-sm tracking-wide">Signing in...</span>
                                </>
                            ) : (
                                <>
                                    <span className="text-sm tracking-widest mt-[1px]">SIGN IN</span>
                                    <LogIn strokeWidth={2} size={16} />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-zinc-400 text-[0.65rem] uppercase tracking-widest mt-8 font-medium">
                    © 2026 SkyComic Administration
                </p>
            </div>
        </div>
    );
};

export default AdminLogin;
