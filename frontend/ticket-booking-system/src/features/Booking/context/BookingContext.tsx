import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  SeatMapType,
  SeatReservationType,
  ConfirmReservationResponseType,
} from '../../../shared/types/SeatReservationType';
import { useAuth } from '../../Auth/context/AuthContext';
import { useNotification } from '../../../shared/context/NotificationContext';
import api from '../../../shared/utils/api';

type BookingContextType = {
  seatMap: SeatMapType | null;
  selectedSeats: number[];
  reservations: SeatReservationType[];
  boardingPoint: string;
  boardingPoints: string[];
  loading: boolean;
  error: string | null;
  timeLeft: number;
  toggleSeat: (seatNumber: number) => void;
  toggleChildTicket: (seatNumber: number) => void;
  childSeats: Set<number>;
  setBoardingPoint: (point: string) => void;
  confirmBooking: () => Promise<void>;
  cancelAll: () => Promise<void>;
  fetchSeatMap: () => Promise<void>;
  fetchReservations: () => Promise<void>;
};

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const { setOptionNotification } = useNotification();
  const userId = Number(localStorage.getItem('userId')) || 0;

  const [seatMap, setSeatMap] = useState<SeatMapType | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [reservations, setReservations] = useState<SeatReservationType[]>([]);
  const [childSeats, setChildSeats] = useState<Set<number>>(new Set());
  const [boardingPoint, setBoardingPoint] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(600);

  const boardingPoints = seatMap?.route
    ? [
        seatMap.route.starting_point,
        ...(seatMap.route.stops
          ? seatMap.route.stops.split(',').map((s) => s.trim())
          : []),
      ]
    : [];

  const fetchSeatMap = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<SeatMapType>(`/seat-reservations/bus-schedule/${id}`);
      setSeatMap(response.data);
    } catch (err) {
      setError('Не удалось загрузить схему мест');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchReservations = useCallback(async () => {
    if (!id || !accessToken) return;
    try {
      const response = await api.get<SeatReservationType[]>(
        `/seat-reservations/user/${userId}?busScheduleId=${id}`
      );
      setReservations(response.data);
      setSelectedSeats(response.data.map((r) => r.seat_number));
      setChildSeats(new Set(response.data.filter((r) => r.is_child).map((r) => r.seat_number)));

      if (response.data.length > 0) {
        const earliestExpiry = Math.min(
          ...response.data.map((r) => new Date(r.expires_at).getTime())
        );
        const remaining = Math.max(0, Math.floor((earliestExpiry - Date.now()) / 1000));
        setTimeLeft(remaining);
      }
    } catch (err) {
      console.error(err);
    }
  }, [id, userId, accessToken]);

  const toggleSeat = async (seatNumber: number) => {
    if (!id || !accessToken) {
      setOptionNotification('Вы не авторизованы', 'error');
      return;
    }

    if (selectedSeats.includes(seatNumber)) {
      const reservation = reservations.find((r) => r.seat_number === seatNumber);
      if (reservation) {
        try {
          await api.delete(`/seat-reservations/${reservation.id}`, {
            data: { user_id: userId },
          });
          setSelectedSeats((prev) => prev.filter((s) => s !== seatNumber));
          setChildSeats((prev) => {
            const next = new Set(prev);
            next.delete(seatNumber);
            return next;
          });
          await fetchReservations();
          await fetchSeatMap();
        } catch (err) {
          setOptionNotification('Не удалось отменить место', 'error');
        }
      }
      return;
    }

    if (!seatMap) return;

    const seatInfo = seatMap.seats.find((s) => s.seat_number === seatNumber);
    if (!seatInfo || seatInfo.status === 'occupied') return;

    try {
      const price = seatMap.route?.price ?? 0;
      const response = await api.post('/seat-reservations/reserve', {
        bus_schedule_id: Number(id),
        seat_number: seatNumber,
        user_id: userId,
        is_child: false,
        price: price,
      });
      if (response.data?.error) {
        setOptionNotification(response.data.error, 'error');
        return;
      }
      setOptionNotification(`Место ${seatNumber} выбрано`, 'success');
      await fetchReservations();
      await fetchSeatMap();
    } catch (err) {
      setOptionNotification('Не удалось забронировать место', 'error');
    }
  };

  const toggleChildTicket = async (seatNumber: number) => {
    if (!id || !accessToken) return;

    const reservation = reservations.find((r) => r.seat_number === seatNumber);
    if (!reservation) return;

    const newIsChild = !childSeats.has(seatNumber);

    try {
      await api.delete(`/seat-reservations/${reservation.id}`, {
        data: { user_id: userId },
      });

      const response = await api.post('/seat-reservations/reserve', {
        bus_schedule_id: Number(id),
        seat_number: seatNumber,
        user_id: userId,
        is_child: newIsChild,
        price: newIsChild ? 0 : seatMap?.route?.price ?? 0,
        boarding_point: boardingPoint || undefined,
      });

      if (response.data?.error) {
        setOptionNotification(response.data.error, 'error');
        return;
      }

      setChildSeats((prev) => {
        const next = new Set(prev);
        if (newIsChild) next.add(seatNumber);
        else next.delete(seatNumber);
        return next;
      });

      await fetchReservations();
    } catch (err) {
      setOptionNotification('Не удалось изменить тип билета', 'error');
    }
  };

  const confirmBooking = async () => {
    if (!id || !accessToken || reservations.length === 0) {
      setOptionNotification('Выберите хотя бы одно место', 'error');
      return;
    }

    if (!boardingPoint) {
      setOptionNotification('Выберите место посадки', 'error');
      return;
    }

    try {
      const response = await api.post<ConfirmReservationResponseType>(
        '/seat-reservations/confirm',
        {
          user_id: userId,
          bus_schedule_id: Number(id),
          boarding_point: boardingPoint,
        }
      );
      if ((response.data as any)?.error) {
        setOptionNotification((response.data as any).error, 'error');
        return;
      }
      setOptionNotification('Бронирование успешно подтверждено!', 'success');
      navigate('/pending-bookings');
    } catch (err) {
      setOptionNotification('Не удалось подтвердить бронирование', 'error');
    }
  };

  const cancelAll = async () => {
    if (!id || !accessToken) return;
    try {
      await api.delete(`/seat-reservations/cancel-all/${id}`, {
        data: { user_id: userId },
      });
      setSelectedSeats([]);
      setReservations([]);
      setChildSeats(new Set());
      setOptionNotification('Резервация отменена', 'success');
      await fetchSeatMap();
    } catch (err) {
      setOptionNotification('Не удалось отменить резервацию', 'error');
    }
  };

  useEffect(() => {
    fetchSeatMap();
  }, [fetchSeatMap]);

  useEffect(() => {
    if (accessToken) {
      fetchReservations();
    }
  }, [fetchReservations, accessToken]);

  useEffect(() => {
    if (reservations.length === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setOptionNotification('Время резервации истекло', 'error');
          setSelectedSeats([]);
          setReservations([]);
          setChildSeats(new Set());
          fetchSeatMap();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [reservations.length > 0]);

  return (
    <BookingContext.Provider
      value={{
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
        fetchSeatMap,
        fetchReservations,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};