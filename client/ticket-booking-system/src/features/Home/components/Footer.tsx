import React from 'react';
import '../styles/css/Footer.css';
import Telegram from '../img/telegram-icon.png';
import Instagram from '../img/instagram-icon.png';
import Vk from '../img/vk-icon.png';


const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          {/* Колонка 1: Логотип и ссылки */}
          <div className="footer__column">
            <div className="footer__logo">
              <img src="/logo.png" alt="Atlas Logo" />
            </div>
            <ul>
              <li><a href="#about">О нас</a></li>
              <li><a href="#contacts">Контакты</a></li>
              <li><a href="#help">Помощь</a></li>
              <li><a href="#privacy">Политика конфиденциальности</a></li>
              <li><a href="#terms">Условия использования</a></li>
            </ul>
          </div>

          {/* Колонка 2: Сотрудничество */}
          <div className="footer__column">
            <h3>Сотрудничество</h3>
            <ul>
              <li><a href="#partners">Стать партнером</a></li>
              <li><a href="#vacancies">Вакансии</a></li>
            </ul>
          </div>

          {/* Колонка 3: Проекты */}
          <div className="footer__column">
            <h3>Проекты</h3>
            <ul>
              <li><a href="#volunteers">Для волонтеров</a></li>
            </ul>
          </div>

          {/* Колонка 4: Социальные сети */}
          <div className="footer__column">
            <h3>Социальные сети</h3>
            <div className="footer__socials">
              <a href="#vk"><img src={Vk} alt="VK" /></a>
              <a href="#telegram"><img src={Telegram} alt="Telegram" /></a>
              <a href="#instagram"><img src={Instagram} alt="Instagram" /></a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;