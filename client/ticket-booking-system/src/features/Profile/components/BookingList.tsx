// src/components/BookingList.tsx
import React, { useState, useEffect } from 'react'; // Импортируем настроенный экземпляр axios
import '../styles/css/BookingList.css';
import axios from 'axios';
import { useAuth } from '../../Auth/context/AuthContext';

// Типы для бронирований
interface Route {
  id: number;
  name: string;
  starting_point: string;
  ending_point: string;
  stops: string;
  distance: string;
  price: string;
}

interface Schedule {
  id: number;
  route_id: number;
  departure_time: string;
  arrival_time: string;
  route: Route;
}

interface Bus {
  id: number;
  bus_number: string;
  capacity: number;
  type: string;
  available: boolean;
}

interface BusSchedule {
  id: number;
  schedule_id: number;
  bus_id: number;
  operating_days: string;
  schedule: Schedule;
  bus: Bus;
}

interface Booking {
  id: number;
  bus_schedule_id: number;
  user_id: number;
  booking_date: string;
  status: string;
  total_price: string;
  busSchedule: BusSchedule;
}

interface Ticket {
  id: number;
  booking_id: number;
  seat_number: number;
  is_child: boolean;
  price: string;
}

interface BookingListProps {
  userId: number;
}


const api = axios.create({
    baseURL: 'http://localhost:3001',
  });

const BookingList: React.FC = () => {
    const { id } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tickets, setTickets] = useState<{ [bookingId: number]: Ticket[] }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // Запрос на получение бронирований с использованием настроенного api
        const bookingResponse = await api.get(`/booking/${id}`);
        const data: Booking[] = bookingResponse.data;

        if (!data) {
          throw new Error('Ответ от сервера пустой');
        }

        setBookings(data);
        setLoading(false);

        // Получение билетов для каждого бронирования
        const ticketPromises = data.map(async (booking) => {
          const ticketResponse = await api.get(`/tickets/${booking.id}`);
          const ticketData: Ticket[] = ticketResponse.data;

          if (!ticketData) {
            throw new Error(`Ответ для билетов бронирования ${booking.id} пустой`);
          }

          return { bookingId: booking.id, tickets: ticketData };
        });

        const ticketResults = await Promise.all(ticketPromises);
        const ticketsMap = ticketResults.reduce(
          (acc, { bookingId, tickets }) => ({
            ...acc,
            [bookingId]: tickets,
          }),
          {}
        );
        setTickets(ticketsMap);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Неизвестная ошибка при загрузке данных'
        );
        setLoading(false);
      }
    };

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
            <div key={booking.id} className="booking-item">
              <div className="booking-item__header">
                <h3>Бронирование</h3>
                <span className="booking-item__date">{formatDate(booking.booking_date)}</span>
                <span className={`booking-item__status booking-item__status--${booking.status.toLowerCase()}`}>
                  {booking.status}
                </span>
              </div>
              <div className="booking-item__details">
                <p>
                  <strong>Маршрут:</strong> {booking.busSchedule.schedule.route.name}
                </p>
                <p>
                  <strong>Время отправления:</strong> {booking.busSchedule.schedule.departure_time}
                </p>
                <p>
                  <strong>Время прибытия:</strong> {booking.busSchedule.schedule.arrival_time}
                </p>
                <p>
                  <strong>Автобус:</strong> {booking.busSchedule.bus.type} ({booking.busSchedule.bus.bus_number})
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BookingList;