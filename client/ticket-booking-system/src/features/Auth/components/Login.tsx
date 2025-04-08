import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/css/Login.css';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let isAdmin = await login(email, password);
            if (isAdmin) navigate('/dashboard');
            else navigate('/home');
        } catch (error) {
            console.error('Login error:', error);
        }
    };

    return (
        <div className="login">
            <div className="login__container">
                <h2>Вход</h2>
                <form onSubmit={handleSubmit} className="login__form">
                    <div className="login__field">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            required
                        />
                    </div>
                    <div className="login__field">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Пароль"
                            required
                        />
                    </div>
                    <button type="submit" className="login__button">Войти</button>
                </form>
                <p className="login__link">
                    Нет аккаунта? <Link to="/register">Зарегистрируйтесь здесь</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;