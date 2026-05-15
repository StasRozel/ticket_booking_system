import React from 'react';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../../Auth/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '../../../shared/components/Header';
import Footer from '../../../shared/components/Footer';
import Notification from '../../../shared/components/Notification';
import { useNotification } from '../../../shared/context/NotificationContext';
import '../styles/css/BookingPage.css';

const SEATS_PER_ROW = 4;

const BookingPage: React.FC = () => {
  const {
    seatMap,
    selectedSeats,
    reservations,
    boardingPoint,
    boardingPoints,
    loading,
    error,
    timeLeft,
    toggleSeat,
    toggleChildTicket,
    childSeats,
    setBoardingPoint,
    confirmBooking,
    cancelAll,
  } = useBooking();

  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const { notification } = useNotification();

  if (!accessToken) {
    navigate('/login');
    return null;
  }

  if (loading) {
    return (
      <div className="app">
        <Header />
        <main className="booking-page">
          <div className="container">
            <div className="booking-page__loading">Загрузка...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <Header />
        <main className="booking-page">
          <div className="container">
            <div className="booking-page__error">{error}</div>
            <button className="booking-page__back-btn" onClick={() => navigate('/')}>
              Вернуться к расписанию
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!seatMap) {
    return (
      <div className="app">
        <Header />
        <main className="booking-page">
          <div className="container">
            <div className="booking-page__empty">Расписание не найдено</div>
            <button className="booking-page__back-btn" onClick={() => navigate('/')}>
              Вернуться к расписанию
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const totalSeats = seatMap.totalSeats || 0;
  const seatRows = [];
  for (let i = 0; i < totalSeats; i += SEATS_PER_ROW) {
    const row: number[] = [];
    for (let j = i + 1; j <= Math.min(i + SEATS_PER_ROW, totalSeats); j++) {
      row.push(j);
    }
    seatRows.push(row);
  }

  const getSeatStatus = (seatNumber: number) => {
    const seat = seatMap.seats.find((s) => s.seat_number === seatNumber);
    if (!seat) return 'unavailable';
    if (selectedSeats.includes(seatNumber)) return 'selected';
    return seat.status;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalPrice = reservations.reduce((sum, r) => {
    return sum + (childSeats.has(r.seat_number) ? 0 : Number(r.price || seatMap.route?.price || 0));
  }, 0);

  return (
    <div className="app">
      <Header />
      <main className="booking-page">
        <div className="container">
          <div className="booking-page__header">
            <h2>Выбор мест</h2>
            <button className="booking-page__back-btn" onClick={() => navigate('/')}>
              ← Назад
            </button>
          </div>

          <div className="booking-page__info">
            <div className="booking-page__route-info">
              <h3>{seatMap.route?.name}</h3>
              <p>
                <strong>Отправление:</strong>{' '}
                {seatMap.departure_time ? seatMap.departure_time.slice(0, 5) : '-'}
              </p>
              <p>
                <strong>Прибытие:</strong>{' '}
                {seatMap.arrival_time ? seatMap.arrival_time.slice(0, 5) : '-'}
              </p>
              <p>
                <strong>Автобус:</strong> {seatMap.busType} ({seatMap.busNumber})
              </p>
              <p>
                <strong>Свободных мест:</strong> {seatMap.availableSeats} из{' '}
                {seatMap.totalSeats}
              </p>
            </div>
          </div>

          {reservations.length > 0 && (
            <div className="booking-page__timer">
              <span className="booking-page__timer-icon">⏱</span>
              <span>
                Время резервации: <strong>{formatTime(timeLeft)}</strong>
              </span>
            </div>
          )}

          <div className="booking-page__seat-scheme">
            <div className="booking-page__driver">
              <span>Водитель</span>
            </div>
            <div className="booking-page__seats-grid">
              {seatRows.map((row, rowIndex) => (
                <div key={rowIndex} className="booking-page__seats-row">
                  {row.map((seatNum, seatIndex) => {
                    const status = getSeatStatus(seatNum);
                    const seatClass = `booking-page__seat booking-page__seat--${status}`;
                    return (
                      <React.Fragment key={seatNum}>
                        {seatIndex === 2 && (
                          <div className="booking-page__aisle" />
                        )}
                        <button
                          className={seatClass}
                          onClick={() => toggleSeat(seatNum)}
                          disabled={status === 'occupied'}
                          title={
                            status === 'occupied'
                              ? 'Место занято'
                              : status === 'selected'
                                ? 'Место выбрано (нажмите для отмены)'
                                : 'Свободное место'
                          }
                        >
                          {seatNum}
                        </button>
                      </React.Fragment>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="booking-page__legend">
            <div className="booking-page__legend-item">
              <div className="booking-page__legend-color booking-page__legend-color--available" />
              <span>Свободно</span>
            </div>
            <div className="booking-page__legend-item">
              <div className="booking-page__legend-color booking-page__legend-color--occupied" />
              <span>Занято</span>
            </div>
            <div className="booking-page__legend-item">
              <div className="booking-page__legend-color booking-page__legend-color--selected" />
              <span>Выбрано</span>
            </div>
          </div>

          {selectedSeats.length > 0 && (
            <div className="booking-page__selected-info">
              <h3>Выбранные места</h3>
              <div className="booking-page__selected-list">
                {selectedSeats.sort((a, b) => a - b).map((seatNum) => (
                  <div key={seatNum} className="booking-page__selected-seat">
                    <span className="booking-page__seat-number">Место {seatNum}</span>
                    <label className="booking-page__child-toggle">
                      <input
                        type="checkbox"
                        checked={childSeats.has(seatNum)}
                        onChange={() => toggleChildTicket(seatNum)}
                      />
                      <span>Детский билет (0 BYN)</span>
                    </label>
                    <span className="booking-page__seat-price">
                      {childSeats.has(seatNum)
                        ? '0.00 BYN'
                        : `${Number(seatMap.route?.price || 0).toFixed(2)} BYN`}
                    </span>
                  </div>
                ))}
              </div>

              <div className="booking-page__boarding">
                <h3>Место посадки</h3>
                <select
                  className="booking-page__boarding-select"
                  value={boardingPoint}
                  onChange={(e) => setBoardingPoint(e.target.value)}
                >
                  <option value="">Выберите место посадки</option>
                  {boardingPoints.map((point, index) => (
                    <option key={index} value={point}>
                      {point}
                    </option>
                  ))}
                </select>
              </div>

              <div className="booking-page__summary">
                <div className="booking-page__total">
                  <strong>Итого:</strong> {totalPrice.toFixed(2)} BYN
                </div>
                <div className="booking-page__actions">
                  <button className="booking-page__confirm-btn" onClick={confirmBooking}>
                    Забронировать
                  </button>
                  <button className="booking-page__cancel-btn" onClick={cancelAll}>
                    Отменить все
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <Notification
        message={notification?.message}
        type={notification?.type}
        duration={5000}
        isClose={true}
      />
    </div>
  );
};

export default BookingPage;