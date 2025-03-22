import React from 'react';
import '../styles/css/AppPromo.css';

const AppPromo: React.FC = () => {
  return (
    <section className="app-promo">
      <div className="container">
        <div className="app-promo__content">
          <h2>В приложении быстрее и еще удобнее!</h2>
          <p>Следите за автобусом в любой точке, где бы вы не находились. Смотрите актуальное расписание, покупайте билеты в телефоне, не выходя из дома.</p>
          <p>Широкий выбор маршрутов. Откройте для себя простоту путешествий с приложением Atlas — мы рядом с вами в любое время.</p>
        </div>
        <div className="app-promo__image">
          <img src="/phone-mockup.png" alt="Phone Mockup" />
          <img src="/app-icon.png" alt="App Icon" className="app-icon" />
        </div>
      </div>
    </section>
  );
};

export default AppPromo;