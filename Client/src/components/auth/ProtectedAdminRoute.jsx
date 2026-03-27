import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedAdminRoute = () => {
    // Check if admin info exists in localStorage
    const admin = localStorage.getItem('admin');

    // If auth failed, redirect to login
    if (!admin) {
        return <Navigate to="/admin/login" replace />;
    }

    // If auth success, render child routes
    return <Outlet />;
};

export default ProtectedAdminRoute;
