import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const AuthProtectedRoute: React.FC = () => {
    const { accessToken, refreshToken, refreshAccessToken } = useAuth();
    const [checked, setChecked] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(!!accessToken);

    useEffect(() => {
        const tryRefresh = async () => {
            if (!accessToken && refreshToken) {
                try {
                    await refreshAccessToken();
                    setIsAuthenticated(true);
                } catch (e) {
                    setIsAuthenticated(false);
                }
            }
            setChecked(true);
        };
        tryRefresh();
    }, []);

    if (!checked) return null; // Можно заменить на спиннер
    if (!isAuthenticated) {
        return <Navigate to="/401" replace />;
    }
    return <Outlet />;
};

export default AuthProtectedRoute;