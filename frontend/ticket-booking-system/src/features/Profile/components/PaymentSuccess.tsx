import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import '../styles/css/BookingList.css';
import Footer from '../../../shared/components/Footer';
import Header from '../../../shared/components/Header';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');

  return (
    <div className="app">
      <Header />
      <main>
        <section className="booking-list">
          <div className="container">
            <div className="booking-list__empty">
              <h2>Оплата прошла успешно!</h2>
              <p>Ваше бронирование подтверждено. Спасибо за покупку.</p>
              {sessionId && (
                <p style={{ fontSize: '0.85rem', color: '#888', marginTop: '8px' }}>
                  ID сессии: {sessionId.slice(0, 20)}...
                </p>
              )}
              <div style={{ marginTop: '24px' }}>
                <button
                  className="button__action"
                  onClick={() => navigate('/profile')}
                  style={{ padding: '12px 32px', fontSize: '1rem' }}
                >
                  Перейти в профиль
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
