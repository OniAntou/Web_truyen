import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// Simple JWT decoder
const ProtectedAdminRoute = () => {
    const adminStr = localStorage.getItem('admin');
    
    // Check for admin presence
    if (!adminStr) {
        return <Navigate to="/admin/login" replace />;
    }

    try {
        const admin = JSON.parse(adminStr);
        // We trust the admin object for UI navigation. 
        // The backend will enforce actual security via HttpOnly cookies.
        if (!admin) {
            return <Navigate to="/admin/login" replace />;
        }
    } catch (e) {
        localStorage.removeItem('admin');
        return <Navigate to="/admin/login" replace />;
    }

    // If success, render child routes
    return <Outlet />;
};

export default ProtectedAdminRoute;
