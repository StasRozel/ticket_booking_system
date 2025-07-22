import React from 'react';
import '../styles/css/AppPromo.css';

const AppPromo: React.FC = () => {
  return (
    <section className="app-promo">
      <div className="container">
        <div className="app-promo__content">
          <h2>Путешествуйте с комфортом и удобством!</h2>
          <p>
            Следите за расписанием автобусов, выбирайте маршруты и покупайте
            билеты онлайн в несколько кликов. Мы сделали всё, чтобы ваши
            поездки были максимально удобными и беззаботными.
          </p>
          <p>
            Широкий выбор направлений и актуальная информация о рейсах — всё
            это доступно на нашей платформе в любое время.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AppPromo;