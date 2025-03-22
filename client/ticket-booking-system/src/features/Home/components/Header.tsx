import React from 'react';
import '../styles/css/Header.css';

const Header: React.FC = () => {
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
          <button className="header__action"><a href='/login'>Войти</a></button>
        </div>
      </div>
    </header>
  );
};

export default Header;