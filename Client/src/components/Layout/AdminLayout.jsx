import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, LogOut, Menu } from 'lucide-react';

const AdminLayout = () => {
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path
            ? 'bg-white/10 text-white font-medium border border-white/10'
            : 'text-zinc-500 hover:bg-white/5 hover:text-white transition-all';
    };

    return (
        <div className="flex h-screen bg-black text-white font-sans overflow-hidden selection:bg-white/20">
            {/* Sidebar */}
            <aside className="w-72 bg-black border-r border-white/5 flex flex-col relative z-20">
                <div className="p-8 border-b border-white/5 flex items-center gap-4">
                    <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center font-bold text-black text-lg shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                        A
                    </div>
                    <h1 className="text-xl font-medium tracking-tight text-white">
                        Admin<span className="text-zinc-500 font-normal">Panel</span>
                    </h1>
                </div>

                <nav className="flex-1 px-4 py-8 space-y-2">
                    <p className="px-4 text-[0.65rem] font-bold text-zinc-600 uppercase tracking-widest mb-4">Menu</p>

                    <Link
                        to="/admin"
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${isActive('/admin')}`}
                    >
                        <LayoutDashboard size={20} className={location.pathname === '/admin' ? 'text-white' : 'text-gray-500 group-hover:text-white'} />
                        <span className="font-medium">Dashboard</span>
                    </Link>

                    <Link
                        to="/admin/comics"
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${isActive('/admin/comics')}`}
                    >
                        <BookOpen size={20} className={location.pathname === '/admin/comics' ? 'text-white' : 'text-gray-500 group-hover:text-white'} />
                        <span className="font-medium">Comics Management</span>
                    </Link>
                </nav>

                <div className="p-4 border-t border-white/5 space-y-2">
                    <Link
                        to="/"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-500 hover:bg-white/5 hover:text-white transition-all duration-300"
                    >
                        <BookOpen size={20} className="stroke-[1.5]" />
                        <span className="font-medium text-sm tracking-wide">View Site</span>
                    </Link>

                    <button
                        onClick={() => {
                            localStorage.removeItem('admin');
                            window.location.href = '/admin/login';
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-500 hover:bg-red-500/10 hover:text-red-500 transition-all duration-300 text-left"
                    >
                        <LogOut size={20} className="stroke-[1.5]" />
                        <span className="font-medium text-sm tracking-wide">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-black relative">
                <div className="container mx-auto px-10 pt-24 pb-12 relative z-10 max-w-7xl">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
