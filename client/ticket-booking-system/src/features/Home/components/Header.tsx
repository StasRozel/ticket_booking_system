import React from 'react';
import '../styles/css/Header.css';
import { useAuth } from '../../Auth/context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

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
            
            <li><Link to="/home">Главная</Link></li>
            <li><Link to="/profile">Профиль</Link></li>
            <li><a href="#contacts">Контакты</a></li>
            <li><Link to="/about">О нас</Link></li>
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