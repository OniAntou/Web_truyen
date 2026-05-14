import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedAdminRoute: React.FC = () => {
    const adminStr = localStorage.getItem('admin');
    
    if (!adminStr) {
        return <Navigate to="/admin/login" replace />;
    }

    try {
        const admin = JSON.parse(adminStr);
        if (!admin) {
            return <Navigate to="/admin/login" replace />;
        }
    } catch (e) {
        localStorage.removeItem('admin');
        return <Navigate to="/admin/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedAdminRoute;
