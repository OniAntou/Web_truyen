import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedCreatorRoute = () => {
    // Check if token exists
    const token = localStorage.getItem('token');

    // If auth failed, redirect to login
    if (!token) {
        return <Navigate to="/auth" replace />;
    }

    // Role-based authorization is enforced by the backend on API calls.
    // For the UI, presence of standard token is enough to enter the studio route.
    return <Outlet />;
};

export default ProtectedCreatorRoute;
