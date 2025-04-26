import React, { useEffect } from 'react'; 
import '../styles/css/BookingList.css';
import { useProfile } from '../ context/ProfileContext';

const BookingList: React.FC = () => {
  const {bookings, tickets, fetchBookings, error, loading } = useProfile();

  // eslint-disable-next-line 
  useEffect(() => {
    fetchBookings();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <div className="booking-list__loading">Загрузка...</div>;
  }

  if (error) {
    return <div className="booking-list__error">{error}</div>;
  }

  if (bookings.length === 0) {
    return <div className="booking-list__empty">У вас нет бронирований.</div>;
  }

  return (
    <section className="booking-list">
      <div className="container">
        <h2>Ваши бронирования</h2>
        <div className="booking-list__items">
          {bookings.map((booking) => (
            <div key={booking.id} className={`booking-item booking-item--${booking.status.toLowerCase()}`}>
              <div className="booking-item__header">
                <h3>Бронирование</h3>
                <span className="booking-item__date">{formatDate(booking.booking_date)}</span>
                <span className={`booking-item__status booking-item__status--${booking.status.toLowerCase()}`}>
                  {booking.status}
                </span>
              </div>
              <div className="booking-item__details">
                <p>
                  <strong>Маршрут:</strong> {booking.busSchedule?.schedule?.route?.name}
                </p>
                <p>
                  <strong>Время отправления:</strong> {booking.busSchedule?.schedule?.departure_time}
                </p>
                <p>
                  <strong>Время прибытия:</strong> {booking.busSchedule?.schedule?.arrival_time}
                </p>
                <p>
                  <strong>Автобус:</strong> {booking.busSchedule?.bus?.type} ({booking.busSchedule?.bus?.bus_number})
                </p>
                <p>
                  <strong>Общая стоимость:</strong> {booking.total_price} BYN
                </p>
              </div>
              <div className="booking-item__tickets">
                <h4>Билеты:</h4>
                {tickets[booking.id]?.length ? (
                  <ul>
                    {tickets[booking.id].map((ticket) => (
                      <li key={ticket.id} className="ticket-item">
                        <span>Место: {ticket.seat_number}</span>
                        <span>{ticket.is_child ? 'Детский' : 'Взрослый'}</span>
                        <span>Цена: {ticket.price} BYN</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Билеты не найдены.</p>
                )}
              </div>
              {booking.status === 'Забронирован' ? <button className='buttin__cansel'>Отменить</button> : ''}
              {booking.status === 'Выбран' ? <button className='button__action'>Забронировать</button> : '' }
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BookingList;