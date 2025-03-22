import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Auth/context/AuthContext';

const Dashboard: React.FC = () => {
    const { accessToken, logout } = useAuth();
    const navigate = useNavigate(); // Добавляем для редиректа после выхода

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login'); // Перенаправляем на страницу логина после выхода
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <div>
            <h2>Dashboard</h2>
            {accessToken ? (
                <>
                    <p>Welcome! You are successfully logged in or registered.</p>
                    <p>Your access token: {accessToken}</p>
                    <button onClick={handleLogout}>Logout</button>
                </>
            ) : (
                <p>You are not logged in. Please <Link to="/login">login</Link>.</p>
            )}
        </div>
    );
};

export default Dashboard;