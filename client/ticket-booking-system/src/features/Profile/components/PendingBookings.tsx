// src/components/PendingBookings.tsx
import React, { useEffect, useState } from 'react';
import '../styles/css/BookingList.css'; // Используем те же стили, что и для BookingList
import Footer from '../../../shared/components/Footer';
import Header from '../../../shared/components/Header';
import { useProfile } from '../context/ProfileContext';
import ConfirmModal from '../../../shared/components/ConfirmModal';
import { useModal } from '../../../shared/context/ModalContext';

const PendingBookings: React.FC= () => {
  
  const { bookings, tickets, fetchPendingBookings, 
          loading, error, formatDate, handleTicketTypeChange, 
          trigger, handleCanselBooking, handleBooking } = useProfile();

  const { modalMessage, isModalOpen, openModal, handleModalClose } = useModal();

  useEffect(() => {
    fetchPendingBookings();
  }, [trigger]);


  if (loading) {
    return (
      <div className="app">
        <Header />
        <main>
          <div className="booking-list__loading">Загрузка...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <Header />
        <main>
          <div className="booking-list__error">{error}</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="app">
        <Header />
        <main>
          <div className="booking-list__empty">У вас нет бронирований для подтверждения.</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="app">
      <Header/>
      <main>
        <section className="booking-list">
          <div className="container">
            <h2>Бронирования для подтверждения</h2>
            <div className="booking-list__items">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className={`booking-item booking-item--${booking.status.toLowerCase()}`}
                >
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
                  </div>
                  <div className="booking-item__tickets">
                    <h4>Билеты:</h4>
                    {tickets[booking.id]?.length ? (
                      <ul>
                        {tickets[booking.id].map((ticket) => (
                          <li key={ticket.id} className="ticket-item">
                            <span>Место: {ticket.seat_number}</span>
                            <span
                              className="ticket-type"
                              onClick={() =>
                                handleTicketTypeChange(ticket.id as number, booking.busSchedule?.schedule?.route_id as number, booking.id, ticket.is_child)
                              }
                            >
                              {ticket.is_child ? 'Детский' : 'Взрослый'}
                            </span>
                            <span>Цена: {ticket.price} BYN</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>Билеты не найдены.</p> 
                    )}
                  </div>
                  <div className="booking-item__actions">
                    <button
                      className="button__action"
                      onClick={() =>handleBooking(booking.id)}
                    >
                      Забронировать
                    </button>
                    <button
                      className="button__cansel"
                      onClick={() =>
                        openModal(
                          'Вы уверены, что хотите отменить это бронирование?',
                          () => handleCanselBooking(booking.id)
                        )
                      }
                    >
                      Отменить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer/>
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        message={modalMessage}
      />
    </div>
  );
};

export default PendingBookings;