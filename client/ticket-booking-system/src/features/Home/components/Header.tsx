import React from 'react';
import '../styles/css/Header.css';
import { useAuth } from '../../Auth/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header__logo">
          <img src="/logo.png" alt="Atlas Logo" />
        </div>
        <nav className="header__nav">
          <ul>
            <li><a href="#main">Главная</a></li>
            <li><a href="#about">О нас</a></li>
            <li><a href="#contacts">Контакты</a></li>
            <li><a href="#routes">Маршруты</a></li>
          </ul>
        </nav>
        <div className="header__actions">
          <button className="header__action">Поездки</button>
          <button className="sidebar__logout" onClick={handleLogout}>
            Выйти
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;