// src/context/HomeContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { BusScheduleType } from '../../../shared/types/BusScheduleType';
import { HomeContextType } from '../../../shared/types/HomeContextType';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../../shared/services/formatDateTime';
import { useAuth } from '../../Auth/context/AuthContext';
import { useNotification } from '../../../shared/context/NotificationContext';

const HomeContext = createContext<HomeContextType | undefined>(undefined);

const api = axios.create({
  baseURL: 'http://localhost:3001',
});

export const HomeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [busSchedules, setSchedules] = useState<BusScheduleType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchFrom, setSearchFrom] = useState<string>(''); // Откуда
  const [searchTo, setSearchTo] = useState<string>(''); // Куда
  const [searchDate, setSearchDate] = useState<string>(''); // Дата
  const [searchPassengers, setSearchPassengers] = useState<string>(''); // Пассажиры

  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const { setOptionNotification } = useNotification();
  const currentDate = new Date();

  const fetchBusSchedule = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<BusScheduleType[]>('/bus-schedules/');
      setSchedules(response.data);
    } catch (err) {
      console.error('Ошибка при загрузке расписания:', err);
      setError('Не удалось загрузить расписание. Попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  const filteredSchedules = busSchedules.filter((schedule) => {
    const route = schedule.schedule?.route;
    const matchesFrom = !searchFrom || (route?.starting_point?.toLowerCase().includes(searchFrom.toLowerCase()) || route?.name?.toLowerCase().includes(searchFrom.toLowerCase()));
    const matchesTo = !searchTo || (route?.ending_point?.toLowerCase().includes(searchTo.toLowerCase()) || route?.name?.toLowerCase().includes(searchTo.toLowerCase()));
    const matchesDate = !searchDate || formatDate(schedule.operating_days) === formatDate(searchDate);
    return matchesFrom && matchesTo && matchesDate;
  });

  const booking = async (busSchedule: BusScheduleType) => {
    if (!accessToken) {
      setOptionNotification("Вы не авторизованны", "error");
      return;
    };

    const bookingObj = {
      bus_schedule_id: busSchedule.id ?? 0, // Если id undefined, используем 0
      user_id: localStorage.getItem('userId') || '',
      booking_date: currentDate.toDateString(),
      status: 'Выбран',
      total_price: busSchedule.schedule?.route?.price ?? '0',
    };
    const response = await api.post('/booking/create/', bookingObj);
    const { id } = response.data;
    const ticketObj = {
      booking_id: id,
      seat_number: 0,
      is_child: true,
      price: busSchedule.schedule?.route?.price ?? '0',
    };
    await api.post('/tickets/create/', ticketObj);
    navigate('/pending-bookings');
  };

  useEffect(() => {
    fetchBusSchedule();
  }, []);

  return (
    <HomeContext.Provider
      value={{
        busSchedules: filteredSchedules,
        loading,
        error,
        fetchBusSchedule,
        booking,
        searchFrom,
        setSearchFrom,
        searchTo,
        setSearchTo,
        searchDate,
        setSearchDate,
        searchPassengers,
        setSearchPassengers
      }}
    >
      {children}
    </HomeContext.Provider>
  );
};

export const useHome = () => {
  const context = useContext(HomeContext);
  if (!context) {
    throw new Error('useHome must be used within an HomeProvider');
  }
  return context;
};