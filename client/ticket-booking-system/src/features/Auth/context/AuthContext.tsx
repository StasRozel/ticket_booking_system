import React, { createContext, useState, useContext } from 'react';
import { login as apiLogin, register as apiRegister } from '../services/api';
import axios from 'axios';
import { socket } from '../../..';

interface AuthContextType {
    id: number;
    accessToken: string | null;
    refreshToken: string | null;
    login: (email: string, password: string) => Promise<boolean>;
    register: (newUser: any) => Promise<void>;
    logout: () => Promise<void>;
    refreshAccessToken: () => Promise<void>;
    roleId: number | null;
    getRoleId: () => Promise<void>;
}



const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem('accessToken'));
    const [refreshToken, setRefreshToken] = useState<string | null>(localStorage.getItem('refreshToken'));
    const [roleId, setRoleId] = useState<number | null>(0);
    const [id, setId] = useState<number>(() => {
        const savedText = localStorage.getItem('userId');
        return savedText ? parseInt(savedText) : 0; // Если есть сохранённое значение, используем его, иначе пустая строка
      });

    
    socket.on('blocked', (userId: number) => {

        if (id === userId) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            window.location.reload();
        }   
    }); 

    const login = async (email: string, password: string): Promise<boolean> => {
        const { user_id: userId, accessToken: newAccessToken, refreshToken: newRefreshToken, isAdmin, isBlocked } = await apiLogin(email, password);
        if (!isBlocked) {
            setAccessToken(newAccessToken);
            setRefreshToken(newRefreshToken);
            setId(userId);
            localStorage.setItem('userId', userId);
            localStorage.setItem('accessToken', newAccessToken);
            localStorage.setItem('refreshToken', newRefreshToken);
        }

        return isAdmin;
    };

    const register = async (newUser: any) => {
        const { user_id: userId, accessToken: newAccessToken, refreshToken: newRefreshToken } = await apiRegister(newUser);
        setAccessToken(newAccessToken);
        setRefreshToken(newRefreshToken);
        setId(userId);
        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        localStorage.setItem('userId', userId);
    };

    const logout = async () => {
        if (refreshToken) {
            await axios.post('http://localhost:3001/auth/logout', { refreshToken });
        }
        setAccessToken(null);
        setRefreshToken(null);
        setId(0);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userId');
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

    const getRoleId = async (): Promise<void> =>  {
        const response = await axios.get(`http://localhost:3001/users/${id}`);
        setRoleId(response.data.role_id);
    }

    return (
        <AuthContext.Provider value={{ id, accessToken, refreshToken, login, register, logout, refreshAccessToken, roleId, getRoleId }}>
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