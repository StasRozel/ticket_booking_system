// src/App.tsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './features/Auth/components/Login';
import Register from './features/Auth/components/Register';
import { useAuth, AuthProvider } from './features/Auth/context/AuthContext';
import { setupAxiosInterceptors } from './features/Auth/services/api';
import Dashboard from './features/Dashboard/components/Dashboard';
import ProtectedRoute from './features/Auth/components/ProtectedRoute';
import Home from './features/Home/components/Home';
import { DashboardProvider } from './features/Dashboard/context/DashboardContext';

const AppContent: React.FC = () => {
    const { refreshAccessToken, logout } = useAuth();

    useEffect(() => {
        setupAxiosInterceptors(refreshAccessToken, logout);
    }, [refreshAccessToken, logout]);
//protected route для ролей
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<Login />} />
                <Route element={<ProtectedRoute />}> 
                    <Route path="/dashboard/*" element={<DashboardProvider><Dashboard /></DashboardProvider>} />
                    <Route path="/home" element={<Home />} />
                </Route>
            </Routes>
        </Router>
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
};

export default App;