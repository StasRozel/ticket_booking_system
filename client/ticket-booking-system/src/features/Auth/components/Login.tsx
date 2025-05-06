import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { loginSchema } from '../schemas/authSchemas';
import '../styles/css/Login.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидация с помощью Zod
    const result = loginSchema.safeParse({ email, password });
    
    if (!result.success) {
      const fieldErrors: { [key: string]: string } = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0]] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    // Очистка ошибок при успешной валидации
    setErrors({});

    try {
      let isAdmin = await login(email, password);
      if (isAdmin) navigate('/dashboard');
      else navigate('/home');
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: 'Ошибка при входе. Проверьте email и пароль' });
    }
  };

  return (
    <div className="login">
      <div className="login__container">
        <h2>Вход</h2>
        {errors.general && <div className="error">{errors.general}</div>}
        <form onSubmit={handleSubmit} className="login__form">
          <div className="login__field">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
            />
            {errors.email && <div className="error">{errors.email}</div>}
          </div>
          <div className="login__field">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Пароль"
              required
            />
            {errors.password && <div className="error">{errors.password}</div>}
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