import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import BottomNav from './BottomNav';

const ClientLayout: React.FC = () => {
    const location = useLocation();
    
    // Check if we should hide normal navbar/footer (e.g. for reader)
    const isReader = location.pathname.startsWith('/read/');
    const isAdmin = location.pathname.startsWith('/admin');
    
    if (isAdmin) return <Outlet />;

    return (
        <div className="flex flex-col min-h-screen">
            {!isReader && <Navbar />}
            <main className={`flex-grow ${!isReader ? 'pt-20 md:pt-24' : ''} pb-[var(--nav-bottom-height)] md:pb-0`}>
                <Outlet />
            </main>
            {!isReader && <Footer />}
            <BottomNav />
        </div>
    );
};

export default ClientLayout;
