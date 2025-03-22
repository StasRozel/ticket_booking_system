import React from 'react';
import '../styles/css/Footer.css';

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
              <li><a href="#cookies">Настройка cookie-файлов</a></li>
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
              <a href="#vk"><img src="/vk-icon.png" alt="VK" /></a>
              <a href="#telegram"><img src="/telegram-icon.png" alt="Telegram" /></a>
              <a href="#tiktok"><img src="/tiktok-icon.png" alt="TikTok" /></a>
              <a href="#youtube"><img src="/youtube-icon.png" alt="YouTube" /></a>
              <a href="#instagram"><img src="/instagram-icon.png" alt="Instagram" /></a>
            </div>
          </div>

          {/* Колонка 5: Мобильное приложение */}
          <div className="footer__column">
            <h3>Мобильное приложение</h3>
            <div className="footer__app-links">
              <a href="#appstore"><img src="/appstore-icon.png" alt="App Store" /></a>
              <a href="#googleplay"><img src="/googleplay-icon.png" alt="Google Play" /></a>
              <a href="#ruapp"><img src="/ruapp-icon.png" alt="RuApp" /></a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;