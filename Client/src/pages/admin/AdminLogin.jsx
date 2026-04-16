import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, BookOpen } from 'lucide-react';
import { API_BASE_URL } from '../../constants/api';

const AdminLogin = () => {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Nếu đã đăng nhập thì redirect luôn về dashboard
    useEffect(() => {
        if (localStorage.getItem('admin')) {
            navigate('/admin', { replace: true });
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!username || !password) {
            setError('Vui lòng nhập đầy đủ thông tin');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('admin', JSON.stringify(data.admin));
                if (data.token) localStorage.setItem('token', data.token);
                navigate('/admin', { replace: true });
            } else {
                setError(data.message || 'Sai tên đăng nhập hoặc mật khẩu');
            }
        } catch (err) {
            console.error(err);
            setError('Không kết nối được tới server. Hãy kiểm tra backend.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4 font-sans selection:bg-white/20">
            <div className="w-full max-w-[380px]">
                {/* Header */}
                <div className="flex flex-col items-center mb-10">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(255,255,255,0.15)]">
                        <BookOpen strokeWidth={1.5} size={22} className="text-black" />
                    </div>
                    <h1 className="text-2xl font-medium text-white tracking-tight">SkyComic</h1>
                    <p className="text-zinc-300 text-sm mt-1.5 font-medium tracking-wide uppercase">Admin Portal</p>
                </div>

                {/* Form Wrapper */}
                <div className="bg-zinc-900/40 rounded-[2rem] p-8 border border-white/[0.04] shadow-2xl backdrop-blur-3xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
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
                                className="w-full bg-black/40 border border-white/5 text-white placeholder-zinc-500 rounded-xl px-4 py-3.5 text-sm outline-none focus:bg-zinc-800/50 focus:border-white/20 transition-all duration-300 disabled:opacity-50"
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
                                    className="w-full bg-black/40 border border-white/5 text-white placeholder-zinc-500 rounded-xl px-4 py-3.5 pr-11 text-sm outline-none focus:bg-zinc-800/50 focus:border-white/20 transition-all duration-300 disabled:opacity-50"
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
                            className="w-full flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 disabled:bg-zinc-400 disabled:opacity-60 text-black font-semibold py-3.5 rounded-xl transition-all duration-300 mt-2 cursor-pointer disabled:cursor-not-allowed shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.25)]"
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
                    © 2025 SkyComic Administration
                </p>
            </div>
        </div>
    );
};

export default AdminLogin;
