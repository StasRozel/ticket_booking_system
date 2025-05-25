import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const AuthProtectedRoute: React.FC = () => {
    const { accessToken, refreshToken, refreshAccessToken, isBlocked, getIsBlocked } = useAuth();
    const [checked, setChecked] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(!!accessToken);

    useEffect(() => {
        const tryRefresh = async () => {
            await getIsBlocked();
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
    if (isBlocked) {
        return <Navigate to="/403" replace />;
    }
    if (!isAuthenticated) {
        return <Navigate to="/401" replace />;
    }
    
    return <Outlet />;
};

export default AuthProtectedRoute;