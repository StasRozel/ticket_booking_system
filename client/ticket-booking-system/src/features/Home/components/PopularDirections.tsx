import React from 'react';
import '../styles/css/PopularDirections.css';

const PopularDirections: React.FC = () => {
  return (
    <section className="popular-directions">
      <div className="container">
        <h2>Популярные направления</h2>
        <div className="popular-directions__grid">
          <div className="direction-card">
            <h3>Берлин → Минск</h3>
            <p>от 380 Br</p>
          </div>
          <div className="direction-card">
            <h3>Берлин → Брест</h3>
            <p>от 350 Br</p>
          </div>
          <div className="direction-card">
            <h3>Берлин → Минск</h3>
            <p>от 380 Br</p>
          </div>
          <div className="direction-card">
            <h3>Берлин → Брест</h3>
            <p>от 350 Br</p>
          </div>
          <div className="direction-card">
            <h3>Великий Новгород → Санкт-Петербург</h3>
            <p>от 420 Br</p>
          </div>
          <div className="direction-card">
            <h3>Санкт-Петербург → Великий Новгород</h3>
            <p>от 420 Br</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PopularDirections;