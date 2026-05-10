import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { BusScheduleType } from '../../../shared/types/BusScheduleType';
import { HomeContextType } from '../../../shared/types/HomeContextType';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../../shared/utils/formatDateTime';
import { useAuth } from '../../Auth/context/AuthContext';
import { useNotification } from '../../../shared/context/NotificationContext';
import api from '../../../shared/utils/api';

const HomeContext = createContext<HomeContextType | undefined>(undefined);

export const HomeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const today = new Date().toISOString().split('T')[0];

  const [busSchedules, setSchedules] = useState<BusScheduleType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchFrom, setSearchFrom] = useState<string>('');
  const [searchTo, setSearchTo] = useState<string>('');
  const [searchDate, setSearchDate] = useState<string>(today);
  const [searchPassengers, setSearchPassengers] = useState<string>('');

  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const { setOptionNotification } = useNotification();
  const currentDate = new Date();

  const fetchBusSchedule = useCallback(async () => {
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
  }, []);

  const filteredSchedules = busSchedules.filter((schedule) => {
    const route = schedule.schedule?.route;
    const matchesFrom = !searchFrom ||
      route?.starting_point?.toLowerCase().includes(searchFrom.toLowerCase());
    const matchesTo = !searchTo ||
      route?.ending_point?.toLowerCase().includes(searchTo.toLowerCase());
    const matchesDate = !searchDate || formatDate(schedule.operating_days) === formatDate(searchDate);
    const matchesPassengers = !searchPassengers ||
      (schedule.bus?.capacity?.length as number >= parseInt(searchPassengers));

    return matchesFrom && matchesTo && matchesDate && matchesPassengers;
  });

  const booking = async (busSchedule: BusScheduleType) => {
    if (!accessToken) {
      setOptionNotification("Вы не авторизованны", "error");
      return;
    };

    const bookingObj = {
      user_id: Number(localStorage.getItem('userId')) || 0,
      bus_schedule_id: busSchedule.id,
      booking_date: currentDate.toISOString(),
      status: 'Выбран',
      total_price: Number(busSchedule.schedule?.route?.price) || 0,
    };

    console.log(bookingObj);

    const response = await api.post('/bookings', bookingObj);
    const { id } = response.data;
    const ticketObj = {
      booking_id: id,
      seat_number: 0,
      is_child: false,
      price: busSchedule.schedule?.route?.price ?? '0',
    };
    await api.post('/tickets', ticketObj);
    navigate('/pending-bookings');
  };

  useEffect(() => {
    fetchBusSchedule();
  }, [fetchBusSchedule]);

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