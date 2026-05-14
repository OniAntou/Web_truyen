import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { useAuthInitialization } from '../hooks/useAuthInitialization';

const ClientLayout: React.FC = () => {
    const location = useLocation();
    useAuthInitialization();
    
    // Check if we should hide normal navbar/footer (e.g. for reader)
    const isReader = location.pathname.startsWith('/read/');
    const isAdmin = location.pathname.startsWith('/admin');
    
    if (isAdmin) return <Outlet />;

    return (
        <div className="app-layout">
            {!isReader && <Navbar />}
            <main className={`app-main ${!isReader ? 'has-navbar' : ''}`}>
                <Outlet />
            </main>
            {!isReader && <Footer />}
        </div>
    );
};

export default ClientLayout;
