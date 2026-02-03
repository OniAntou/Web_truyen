import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, LogOut, Menu } from 'lucide-react';

const AdminLayout = () => {
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path 
            ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' 
            : 'text-gray-400 hover:bg-gray-800 hover:text-white hover:pl-5';
    };

    return (
        <div className="flex h-screen bg-[#0a0a0a] text-gray-100 font-sans overflow-hidden">
            {/* Sidebar */}
            <aside className="w-72 bg-[#111] border-r border-gray-800 flex flex-col relative z-20">
                <div className="p-8 border-b border-gray-800 flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white text-lg shadow-lg">
                        A
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-white">
                        Admin<span className="text-purple-500">Panel</span>
                    </h1>
                </div>

                <nav className="flex-1 px-4 py-8 space-y-2">
                    <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Menu</p>
                    
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

                <div className="p-4 border-t border-gray-800">
                    <Link
                        to="/"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-all duration-300"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Back to Site</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-[#0a0a0a] relative">
                {/* Background Decoration */}
                <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-purple-900/10 to-transparent pointer-events-none" />
                
                <div className="container mx-auto px-8 py-10 relative z-10 max-w-7xl">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
