import React from 'react';
import '../styles/css/Hero.css';

const Hero: React.FC = () => {
  return (
    <section className="hero">
      <div className="hero__background">
        <div className="container">
          <h1>Купить билет на маршрут или автобус по Беларуси</h1>
          <div className="hero__search">
            <input type="text" placeholder="Откуда?" />
            <input type="text" placeholder="Куда?" />
            <input type="date" defaultValue="2025-03-22" />
            <input type="text" placeholder="1 пассажир" />
            <button className="hero__search-btn">Найти</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;