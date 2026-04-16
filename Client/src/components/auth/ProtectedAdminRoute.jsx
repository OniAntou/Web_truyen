import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// Simple JWT decoder
const decodeToken = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
};

const ProtectedAdminRoute = () => {
    const admin = localStorage.getItem('admin');
    const token = localStorage.getItem('token');
    
    // Check for admin presence
    if (!admin || !token) {
        return <Navigate to="/admin/login" replace />;
    }

    // Double check role from token
    const user = decodeToken(token);
    if (!user || user.role !== 'admin') {
        // Clear suspicious local storage
        localStorage.removeItem('admin');
        return <Navigate to="/admin/login" replace />;
    }

    // If auth success, render child routes
    return <Outlet />;
};

export default ProtectedAdminRoute;
