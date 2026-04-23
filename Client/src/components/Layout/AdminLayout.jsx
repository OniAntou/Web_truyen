import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, LogOut, Menu, UserPlus, Users, MessageSquare, Flag } from 'lucide-react';

const AdminLayout = () => {
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path
            ? 'bg-white/[0.05] text-white border border-white/10'
            : 'text-zinc-500 hover:text-zinc-300 transition-colors';
    };

    return (
        <div className="flex h-screen bg-[#090909] text-zinc-300 font-sans overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-black border-r border-white/5 flex flex-col relative z-20">
                <div className="p-6 border-b border-white/5 flex items-center gap-3">
                    <div className="w-9 h-9 rounded bg-white flex items-center justify-center font-bold text-black text-lg">
                        A
                    </div>
                    <h1 className="text-base font-bold tracking-wider uppercase text-white/90">
                        Admin<span className="text-zinc-600 font-medium">Panel</span>
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

                    <Link
                        to="/admin/applications"
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${isActive('/admin/applications')}`}
                    >
                        <UserPlus size={20} className={location.pathname === '/admin/applications' ? 'text-white' : 'text-gray-500 group-hover:text-white'} />
                        <span className="font-medium">Applications</span>
                    </Link>

                    <Link
                        to="/admin/users"
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${isActive('/admin/users')}`}
                    >
                        <Users size={20} className={location.pathname === '/admin/users' ? 'text-white' : 'text-gray-500 group-hover:text-white'} />
                        <span className="font-medium">User Management</span>
                    </Link>

                    <Link
                        to="/admin/comments"
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${isActive('/admin/comments')}`}
                    >
                        <MessageSquare size={20} className={location.pathname === '/admin/comments' ? 'text-white' : 'text-gray-500 group-hover:text-white'} />
                        <span className="font-medium">Comments</span>
                    </Link>

                    <Link
                        to="/admin/reports"
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${isActive('/admin/reports')}`}
                    >
                        <Flag size={20} className={location.pathname === '/admin/reports' ? 'text-white' : 'text-gray-500 group-hover:text-white'} />
                        <span className="font-medium">Reports</span>
                    </Link>
                </nav>
                
                <div className="p-4 border-t border-white/5 space-y-1">
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
                            localStorage.removeItem('adminToken');
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
            <main className="flex-1 overflow-y-auto bg-[#0d0d0d]">
                <div className="w-full max-w-[1440px] mx-auto px-8 lg:px-10 py-12">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
