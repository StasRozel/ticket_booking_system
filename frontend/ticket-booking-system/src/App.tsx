import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './features/Auth/components/Login';
import Register from './features/Auth/components/Register';
import { useAuth, AuthProvider } from './features/Auth/context/AuthContext';
import { setupAxiosInterceptors } from './shared/services/api';
import Dashboard from './features/Dashboard/components/Dashboard';
import Home from './features/Home/components/Home';
import { DashboardProvider } from './features/Dashboard/context/DashboardContext';
import Profile from './features/Profile/components/Profile';
import AboutUs from './features/AboutUs/components/AboutUs';
import Contacts from './features/Contacts/components/Contacts';
import { ProfileProvider } from './features/Profile/context/ProfileContext';
import { HomeProvider } from './features/Home/context/HomeContext';
import PendingBookings from './features/Profile/components/PendingBookings';
import { ModalProvider } from './shared/context/ModalContext';
import AuthProtectedRoute from './features/Auth/components/AuthProtectedRoute';
import AdminProtectedRoute from './features/Auth/components/AdminProtectedRoute';
import ErrorPage from './features/Error/components/ErrorPage';
import { NotificationProvider } from './shared/context/NotificationContext';
import { Radio } from './features/Radio/components/Radio';

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
                <Route path="/" element={<HomeProvider><Home /></HomeProvider>} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/contacts" element={<Contacts />} />
                <Route path="/401" element={<ErrorPage statusCode={401} />} />
                <Route path="/403" element={<ErrorPage statusCode={403} />} />
                <Route path="*" element={<ErrorPage statusCode={404} />} />
                <Route path='/radio' element={<Radio />}></Route>
                <Route element={<AuthProtectedRoute />}>
                    <Route element={<AdminProtectedRoute />}>
                        <Route path="/dashboard/*" element={<DashboardProvider><Dashboard /></DashboardProvider>} />
                    </Route>
                    <Route path="/profile" element={<ProfileProvider><Profile /></ProfileProvider>} />
                    <Route path="/pending-bookings" element={<ProfileProvider> <PendingBookings /></ProfileProvider>} />

                </Route>
            </Routes>
        </Router>
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <ModalProvider>
                <NotificationProvider>
                    <AppContent />
                </NotificationProvider>
            </ModalProvider>
        </AuthProvider>
    );
};

export default App;