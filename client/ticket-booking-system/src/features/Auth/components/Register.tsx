import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { registerSchema } from '../schemas/authSchemas';
import '../styles/css/Register.css';

const Register: React.FC = () => {
  const [first_name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');
  const [middle_name, setMiddleName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { register } = useAuth();
  const navigate = useNavigate();
  const role_id = 2;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Валидация с помощью Zod
    const result = registerSchema.safeParse({
      first_name,
      last_name,
      middle_name,
      email,
      password,
      confirmPassword,
    });

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
      await register({ first_name, last_name, middle_name, role_id, email, password });
      if (role_id !== 2) navigate('/dashboard');
      else navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ general: 'Ошибка при регистрации. Попробуйте снова' });
    }
  };

  return (
    <div className="register">
      <div className="register__container">
        <h2>Регистрация</h2>
        {errors.general && <div className="error">{errors.general}</div>}
        <form onSubmit={handleSubmit} className="register__form">
          <div className="register__field">
            <input
              type="text"
              value={first_name}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Имя"
              required
            />
            {errors.name && <div className="error">{errors.name}</div>}
          </div>
          <div className="register__field">
            <input
              type="text"
              value={last_name}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Фамилия"
              required
            />
            {errors.name && <div className="error">{errors.name}</div>}
          </div>
          <div className="register__field">
            <input
              type="text"
              value={middle_name}
              onChange={(e) => setMiddleName(e.target.value)}
              placeholder="Отчество"
              required
            />
            {errors.name && <div className="error">{errors.name}</div>}
          </div>
          <div className="register__field">
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
            />
            {errors.email && <div className="error">{errors.email}</div>}
          </div>
          <div className="register__field">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Пароль"
              required
            />
            {errors.password && <div className="error">{errors.password}</div>}
          </div>
          <div className="register__field">
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Подтвердите пароль"
              required
            />
            {errors.confirmPassword && (
              <div className="error">{errors.confirmPassword}</div>
            )}
          </div>
          <button type="submit" className="register__button">
            Зарегистрироваться
          </button>
        </form>
        <p className="register__link">
          Уже есть аккаунт? <Link to="/login">Войдите здесь</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;    