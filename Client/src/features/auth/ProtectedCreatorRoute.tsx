import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const ProtectedCreatorRoute: React.FC = () => {
    const { user } = useAuthStore();
    
    // Check if user is logged in AND has creator/admin role
    // Admins are usually allowed to access creator studio
    if (!user || (user.role !== 'creator' && user.role !== 'admin')) {
        return <Navigate to="/auth" replace />;
    }

    return <Outlet />;
};

export default ProtectedCreatorRoute;
