import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';
import { TicketType } from '../../../shared/types/TicketType';
import { ProfileContextType } from '../../../shared/types/ProfileContextType';
import { UserType } from '../../../shared/types/UserType';
import { BookingType } from '../../../shared/types/BookingType';

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const api = axios.create({
    baseURL: 'http://localhost:3001',
});

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserType | null>(null);
    const [bookings, setBookings] = useState<BookingType[]>([]);
    const [tickets, setTickets] = useState<{ [bookingId: number]: TicketType[] }>({});
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isScrolled, setIsScrolled] = useState(false);
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

    const handleScroll = () => {
        if (window.scrollY > 50) {
            setIsScrolled(true);
        } else {
            setIsScrolled(false);
        }
    };

    const handleEdit = () => {
        console.log('Редактировать профиль');
        // Логика редактирования профиля
    };

    const fetchBookings = async () => {
        try {
          // Запрос на получение бронирований с использованием настроенного api
          const bookingResponse = await api.get(`/booking/${userId}`);
          const data: BookingType[] = bookingResponse.data;
  
          if (!data) {
            throw new Error('Ответ от сервера пустой');
          }
  
          setBookings(data);
          setLoading(false);
  
          // Получение билетов для каждого бронирования
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
    return (
        <ProfileContext.Provider value={{
            loading, error, isScrolled, user, fetchUser, handleScroll, handleEdit, bookings, tickets, fetchBookings
        }}>
            {children}
        </ProfileContext.Provider>
    );
};

export const useProfile = () => {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error('useDashboard must be used within an DashboardProvider');
    }
    return context;
};