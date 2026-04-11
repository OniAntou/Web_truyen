import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedCreatorRoute = () => {
    // Check if token and user exist
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    // If auth failed, redirect to login
    if (!token || !userStr) {
        return <Navigate to="/auth" replace />;
    }

    try {
        // Enforce role-based authorization for the UI
        const user = JSON.parse(userStr);
        if (user.role !== 'creator') {
            // Redirect admins and normal users away from studio
            return <Navigate to="/" replace />;
        }
    } catch (e) {
        return <Navigate to="/auth" replace />;
    }

    return <Outlet />;
};

export default ProtectedCreatorRoute;
