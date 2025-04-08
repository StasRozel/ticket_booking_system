import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/css/Register.css';

const Register: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState(''); // Добавляем состояние для подтверждения пароля
    const { register } = useAuth();
    const navigate = useNavigate();
    const role_id = 2;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert('Пароли не совпадают!');
            return;
        }
        try {
            await register({ name, role_id, email, password });
            if (role_id !== 2) navigate('/dashboard');
            else navigate('/home')
        } catch (error) {
            console.error('Registration error:', error);
        }
    };

    return (
        <div className="register">
            <div className="register__container">
                <h2>Регистрация</h2>
                <form onSubmit={handleSubmit} className="register__form">
                    <div className="register__field">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Имя"
                            required
                        />
                    </div>
                    <div className="register__field">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            required
                        />
                    </div>
                    <div className="register__field">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Пароль"
                            required
                        />
                    </div>
                    <div className="register__field">
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Подтвердите пароль"
                            required
                        />
                    </div>
                    <button type="submit" className="register__button">Зарегистрироваться</button>
                </form>
                <p className="register__link">
                    Уже есть аккаунт? <Link to="/login">Войдите здесь</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;