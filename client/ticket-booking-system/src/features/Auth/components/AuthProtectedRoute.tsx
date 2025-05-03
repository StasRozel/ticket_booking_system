import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthProtectedRoute: React.FC = () => {
    const { accessToken } = useAuth();

    if (!accessToken) {
        return <Navigate to="/401" replace />;
    }
    return <Outlet />;
};

export default AuthProtectedRoute;