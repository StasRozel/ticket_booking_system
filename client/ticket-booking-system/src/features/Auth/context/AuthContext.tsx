import React, { createContext, useState, useContext } from 'react';
import { login as apiLogin, register as apiRegister } from '../services/api';
import axios from 'axios';

interface AuthContextType {
    accessToken: string | null;
    refreshToken: string | null;
    login: (email: string, password: string) => Promise<boolean>;
    register: (newUser: any) => Promise<void>;
    logout: () => Promise<void>;
    refreshAccessToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem('accessToken'));
    const [refreshToken, setRefreshToken] = useState<string | null>(localStorage.getItem('refreshToken'));

    const login = async (email: string, password: string): Promise<boolean> => {
        const { accessToken: newAccessToken, refreshToken: newRefreshToken , isAdmin} = await apiLogin(email, password);
        setAccessToken(newAccessToken);
        setRefreshToken(newRefreshToken);
        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        return isAdmin;
    };

    const register = async (newUser: any) => {
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await apiRegister(newUser);
        setAccessToken(newAccessToken);
        setRefreshToken(newRefreshToken);
        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
    };

    const logout = async () => {
        if (refreshToken) {
            await axios.post('http://localhost:3001/auth/logout', { refreshToken });
        }
        setAccessToken(null);
        setRefreshToken(null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    };

    const refreshAccessToken = async () => {
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }
        const response = await axios.post('http://localhost:3001/auth/refresh', { refreshToken });
        const newAccessToken = response.data.accessToken;
        setAccessToken(newAccessToken);
        localStorage.setItem('accessToken', newAccessToken);
    };

    return (
        <AuthContext.Provider value={{ accessToken, refreshToken, login, register, logout, refreshAccessToken }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};