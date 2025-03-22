import React, { createContext, useState, useContext } from 'react';
import { login as apiLogin, register as apiRegister } from '../services/api';

interface AuthContextType {
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (newUser: any) =>  Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

    const login = async (email: string, password: string) => {
        const newToken = await apiLogin(email, password); // Используем импортированную функцию
        setToken(newToken);
        localStorage.setItem('token', newToken);
    };
    
    const register = async (newUser: any) => {
        const {name, role_id, email, password} = newUser;
        const newToken = await apiRegister(name, role_id, email, password); // Используем импортированную функцию
        setToken(newToken);
        localStorage.setItem('token', newToken);
    };

    const logout = () => {
        setToken(null);
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ token, login, register, logout }}>
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