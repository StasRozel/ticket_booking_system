import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';
import { TicketType } from '../../../shared/types/TicketType';
import { ProfileContextType } from '../../../shared/types/ProfileContextType';
import { UserType } from '../../../shared/types/UserType';
import { BookingType } from '../../../shared/types/BookingType';
import api from '../../../shared/services/api';

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [bookings, setBookings] = useState<BookingType[]>([]);
  const [tickets, setTickets] = useState<{ [bookingId: number]: TicketType[] }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [trigger, setTrigger] = useState(0);
  const userId = localStorage.getItem('userId');

  const fetchUser = async () => {
    if (!userId) {
      setError('Пользователь не авторизован. Пожалуйста, войдите в аккаунт.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await api.get<UserType>(`/users/${userId}`);
      setUser(response.data);
    } catch (err) {
      console.error('Ошибка при загрузке данных пользователя:', err);
      setError('Не удалось загрузить данные пользователя. Попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async (userId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<UserType>(`/users/${userId}`);
      console.log(response.data);
      setUser(response.data);
    } catch (err) {
      console.error('Ошибка при загрузке данных профиля:', err);
      setError('Не удалось загрузить данные профиля. Попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (userId: number, data: Partial<UserType>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.patch(`/users/update/${userId}`, data);
      setUser((prevUser) => (prevUser ? { ...prevUser, ...response.data } : null));
      console.log('Профиль успешно обновлен!');
    } catch (err) {
      console.error('Ошибка при обновлении профиля:', err);
      setError('Не удалось обновить профиль. Попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = () => {
    if (window.scrollY > 50) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const bookingResponse = await api.get(`/booking/${userId}`);
      const data: BookingType[] = bookingResponse.data;

      if (!data) {
        throw new Error('Ответ от сервера пустой');
      }

      setBookings(data);
      setLoading(false);

      const ticketPromises = data.map(async (booking) => {
        const ticketResponse = await api.get(`/tickets/${booking.id}`);
        const ticketData: TicketType[] = ticketResponse.data;

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

  const fetchPendingBookings = async () => {
    try {
      const bookingResponse = await api.get(`/booking/${userId}`);
      const data: BookingType[] = bookingResponse.data;

      if (!data) {
        throw new Error('Ответ от сервера пустой');
      }

      const pendingBookings = data.filter((booking) => booking.status.toLowerCase() === 'выбран');
      setBookings(pendingBookings);
      setLoading(false);

      const ticketPromises = pendingBookings.map(async (booking) => {
        const ticketResponse = await api.get(`/tickets/${booking.id}`);
        const ticketData: TicketType[] = ticketResponse.data;

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
        err instanceof Error ? err.message : 'Неизвестная ошибка при загрузке данных'
      );
      setLoading(false);
    }
  };

  const handleTicketTypeChange = async (ticketId: number, routeId: number, bookingId: number, isChild: boolean) => {
    try {
      const ticketPrice = await api.get(`/price/${routeId}`);
      setTickets((prev) => ({
        ...prev,
        [bookingId]: prev[bookingId].map((ticket) =>
          ticket.id === ticketId
            ? {
                ...ticket,
                is_child: !isChild,
                price: !isChild ? '0.00' : ticketPrice.data,
              }
            : ticket
        ),
      }));
    } catch (err) {
      setError('Не удалось обновить тип билета Error: ' + err);
    }
  };

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

  const handleBooking = async (bookingId: number) => {
    try {
      // Получаем тикеты для bookingId
      const ticketPromises = tickets[bookingId]?.map((ticket) =>
        api.patch(`/tickets/update/${ticket.id}`, { is_child: ticket.is_child })
      ) || [];
  
      // Запрос на обновление брони
      const bookingPromise = api.patch(`/booking/update/${bookingId}`, { status: 'Забронирован' });
  
      // Выполняем все запросы параллельно
      await Promise.all([...ticketPromises, bookingPromise]);
  
      // Обновляем триггер
      setTrigger((next) => ++next);
    } catch (err) {
      console.error('Ошибка при обновлении тикетов или брони:', err);
      setError('Не удалось обновить бронирование. Попробуйте снова.');
    }
  };

  const handleCanselTicket = async (data: TicketType) => {
    await api.patch(`/tickets/cansel/${data.id}`, data);
    setTrigger((next) => ++next);
  };

  const handleCanselBooking = async (id: number) => {
    await api.patch(`/booking/cansel/${id}`, { status: 'Отменен' });
    setTrigger((next) => ++next);
  };

  return (
    <ProfileContext.Provider
      value={{
        trigger,
        loading,
        error,
        isScrolled,
        user,
        fetchUser,
        handleScroll,
        bookings,
        tickets,
        fetchBookings,
        handleBooking,
        handleCanselBooking,
        handleCanselTicket,
        fetchPendingBookings,
        handleTicketTypeChange,
        formatDate,
        fetchUserProfile,
        updateUserProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within an ProfileProvider');
  }
  return context;
};