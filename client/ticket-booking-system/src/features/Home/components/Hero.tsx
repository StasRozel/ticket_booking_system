// src/components/Hero.tsx
import React from 'react';
import '../styles/css/Hero.css';
import { useHome } from '../context/HomeContext';

const Hero: React.FC = () => {
  const {
    searchFrom,
    setSearchFrom,
    searchTo,
    setSearchTo,
    searchDate,
    setSearchDate,
    searchPassengers,
    setSearchPassengers,
  } = useHome();

  return (
    <section className="hero">
      <div className="hero__background">
        <div className="container">
          <h1>Купить билет на маршрут или автобус по Беларуси</h1>
          <div className="hero__search">
            <input
              type="text"
              placeholder="Откуда?"
              value={searchFrom}
              onChange={(e) => setSearchFrom(e.target.value)}
            />
            <input
              type="text"
              placeholder="Куда?"
              value={searchTo}
              onChange={(e) => setSearchTo(e.target.value)}
            />
            <input
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
            />
            <input
              type="text"
              placeholder="Пассажиры"
              value={searchPassengers}
              onChange={(e) => setSearchPassengers(e.target.value)}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;