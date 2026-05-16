import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { BusScheduleType } from '../../../shared/types/BusScheduleType';
import { HomeContextType } from '../../../shared/types/HomeContextType';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const { accessToken } = useAuth();
  const { setOptionNotification } = useNotification();

  useEffect(() => {
    const state = location.state as { fromMap?: boolean; departure?: string; arrival?: string } | null;
    if (state?.fromMap) {
      if (state.departure) setSearchFrom(state.departure);
      if (state.arrival) setSearchTo(state.arrival);
      window.history.replaceState({}, document.title);
    }
  }, []);

  const fetchBusSchedule = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<BusScheduleType[]>(`/bus-schedules/date/${searchDate}`);
      setSchedules(response.data);
    } catch (err) {
      console.error('Ошибка при загрузке расписания:', err);
      setError('Не удалось загрузить расписание. Попробуйте снова.');
    } finally {
      setLoading(false);
    }
  }, [searchDate]);

  const filteredSchedules = busSchedules.filter((schedule) => {
    const route = schedule.schedule?.route;
    const allStops = [route?.starting_point, ...(route?.stops?.split(',').map(s => s.trim()) || []), route?.ending_point].filter(Boolean);

    const matchesFrom = !searchFrom ||
      allStops.some(s => s?.toLowerCase().includes(searchFrom.toLowerCase()));
    const matchesTo = !searchTo ||
      allStops.some(s => s?.toLowerCase().includes(searchTo.toLowerCase()));
    const matchesDate = !searchDate || formatDate(schedule.operating_days) === formatDate(searchDate);
    const matchesPassengers = !searchPassengers ||
      ((schedule.available_seats ?? schedule.bus?.capacity?.length ?? 0) >= parseInt(searchPassengers));

    return matchesFrom && matchesTo && matchesDate && matchesPassengers;
  });

  const booking = async (busSchedule: BusScheduleType) => {
    if (!accessToken) {
      setOptionNotification("Вы не авторизованны", "error");
      return;
    };
    navigate(`/booking/${busSchedule.id}`, {
      state: {
        fromMapDeparture: searchFrom || undefined,
        fromMapArrival: searchTo || undefined,
      }
    });
  };

  useEffect(() => {
    fetchBusSchedule();
  }, [searchDate, fetchBusSchedule]);

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