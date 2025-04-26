import React, { useEffect, useState } from 'react';
import '../styles/css/AboutUs.css';
import Header from '../../../shared/components/Header';
import Footer from '../../../shared/components/Footer';
import { Link } from 'react-router';

const AboutUs: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  // Обработка скролла для хедера
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  return (
    <>
    <Header />

      {/* Секция "О нас" */}
      <section className="about-us">
        <div className="container">
          <div className="about-us__header">
            <h2>О нас</h2>
            <p className="about-us__intro">
              Мы — ваш надёжный партнёр в мире маршрутных такси. Наша миссия — сделать ваши поездки удобными, безопасными и доступными.
            </p>
          </div>
          <div className="about-us__content">
            <div className="about-us__card">
              <h3>Наша миссия</h3>
              <p>
                Обеспечить удобный доступ к маршрутам и расписаниям, чтобы вы могли легко планировать свои поездки и наслаждаться путешествиями без лишних забот.
              </p>
            </div>
            <div className="about-us__card">
              <h3>Наши ценности</h3>
              <ul>
                <li>Надёжность — мы всегда вовремя.</li>
                <li>Комфорт — современные автобусы и удобные сервисы.</li>
                <li>Доступность — широкий выбор маршрутов и простая покупка билетов.</li>
              </ul>
            </div>
            <div className="about-us__card">
              <h3>Почему выбирают нас</h3>
              <p>
                Мы предлагаем актуальное расписание, удобный интерфейс для покупки билетов и поддержку на каждом этапе вашей поездки. С нами путешествовать легко!
              </p>
            </div>
          </div>
          <div className="about-us__cta">
            <Link to="/home" className="about-us__cta-button">
              Посмотреть маршруты
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default AboutUs;