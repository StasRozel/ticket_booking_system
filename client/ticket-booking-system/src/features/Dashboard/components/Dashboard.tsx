// src/components/Dashboard.tsx
import React from 'react';
import { useAuth } from '../../Auth/context/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
    const { token, logout } = useAuth();

    return (
        <div>
            <h2>Dashboard</h2>
            {token ? (
                <>
                    <p>Welcome! You are successfully logged in or registered.</p>
                    <p>Your token: {token}</p>
                    <button onClick={logout}>Logout</button>
                </>
            ) : (
                <p>You are not logged in. Please <Link to="/login">login</Link>.</p>
            )}
        </div>
    );
};

export default Dashboard;