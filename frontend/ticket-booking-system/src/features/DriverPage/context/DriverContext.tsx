import React, { createContext, useContext, useState, ReactNode } from 'react';
import api from '../../../shared/services/api';

// ---------------------- Типы ----------------------
interface Stop {
  id: number;
  name: string;
  order: number;
  arrivedAt?: string | null;
}

interface Passenger {
  id: number;
  firstName: string;
  lastName: string;
  middleName?: string;
  phone?: string;
  isPresent: boolean;
  status: string;
  boardingStop: string;
  alightingStop: string;
}

interface CurrentRoute {
  id: number;
  from: string;
  to: string;
  departureTime: string;
  stops: Stop[];
}

interface DriverData {
  id: number;
  fullName: string;
  phone: string;
  currentRoute: CurrentRoute;
  passengers: Passenger[];
}

// ---------------------- Контекст ----------------------
interface DriverContextType {
  driver: DriverData | null;
  loading: boolean;
  error: string | null;
  fetchDriverData: () => Promise<void>;
  markPassengerPresent: (passengerId: number) => Promise<void>;
  reportPassenger: (passengerId: number, reason?: string) => Promise<void>;
  markArrivalAtStop: (stopId: number) => Promise<void>;
  markAllArrived: () => Promise<void>;
  sendDelayNotification: (minutes: number, reason?: string) => Promise<void>;
  notifyDelaySchedule: (minutes: number, reason?: string) => Promise<void>;
  sendUrgentCall: (coords?: { latitude: number; longitude: number }) => Promise<any>;
  submitComplaint: (passengerId: number, complaintText: string) => Promise<void>;
}

const DriverContext = createContext<DriverContextType | undefined>(undefined);

export const useDriver = () => {
  const context = useContext(DriverContext);
  if (!context) throw new Error('useDriver must be used within DriverProvider');
  return context;
};

const DriverProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [driver, setDriver] = useState<DriverData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const userId = localStorage.getItem('userId');



  const fetchDriverData = async () => {
    setLoading(true);
    try {
      const { first_name, last_name, middle_name } = await api.get(`/users/${userId}`).then(res => res.data);
      const busId = await api.get(`/drivers/user/${userId}`).then(res => res.data.bus_id);
      const busScheduleId = await api.get(`/bus-schedules/bus/${busId}`).then(res => res.data[1].id); // берем второй по времени рейс
      const resp = await api.get(`/bus-schedules/${busScheduleId}`);
      const scheduleData = resp.data;

      const routeData = scheduleData.schedule?.route;

      if (!routeData) {
        throw new Error("Route data not found in schedule");
      }

      // В БД поле stops может приходить как JSON-string или CSV "Орша, Могилёв"
      let stops: any[] = [];
      if (routeData.stops) {
        if (typeof routeData.stops === 'string') {
          const s = routeData.stops.trim();
          // Попробуем распарсить JSON; если не JSON — разобьём по запятой
          try {
            const parsed = JSON.parse(s);
            if (Array.isArray(parsed)) stops = parsed;
          } catch (_e) {
            // Разделим по запятым и создадим объекты остановок
            stops = s.split(',').map((name: string, idx: number) => ({ id: idx + 1, name: name.trim(), order: idx + 1 }));
          }
        } else if (Array.isArray(routeData.stops)) {
          stops = routeData.stops;
        }
      }

      if (!stops.length) stops = [];

      // Применяем сохраненный прогресс (visited_stops)
      const visitedStops = scheduleData.visited_stops || [];
      if (Array.isArray(visitedStops) && visitedStops.length > 0) {
        stops = stops.map((s: any) => ({
          ...s,
          arrivedAt: visitedStops.includes(s.id) ? new Date().toISOString() : undefined
        }));
      }

      const fetchedRoute = {
        id: routeData.id,
        name: routeData.name ?? '',
        from: routeData.starting_point ?? routeData.from ?? '',
        to: routeData.ending_point ?? routeData.to ?? '',
        departureTime: scheduleData.schedule.departure_time ?? routeData.departureTime ?? '',
        stops: stops,
        distance: routeData.distance !== undefined ? Number(routeData.distance) : 0,
        price: routeData.price !== undefined ? Number(routeData.price) : 0,
      };

      let passengers: Passenger[] = [];
      try {
        const bookingsResp = await api.get(`/booking/schedule/${scheduleData.id}`);
        const bookings = bookingsResp.data;

        if (Array.isArray(bookings)) {
          passengers = bookings.map((b: any) => ({
            id: b.user?.id || b.id,
            firstName: b.user?.first_name || 'Unknown',
            lastName: b.user?.last_name || 'Unknown',
            middleName: b.user?.middle_name || '',
            phone: b.user?.phone_number || '',
            seatNumber: b.tickets && b.tickets.length > 0 ? b.tickets[0].seat_number : 0,
            isPresent: b.status === 'В дороге',
            status: b.status,
            boardingStop: fetchedRoute.from,
            alightingStop: fetchedRoute.to
          }));
        }
      } catch (err) {
        console.error('[driver] failed to load bookings', err);
      }

      // Build driver object: fullName kept, phone empty, passengers empty for now
      const driverFromServer: DriverData = {
        id: scheduleData.id,
        fullName: `${last_name} ${first_name} ${middle_name || ''}`.trim(),
        phone: '',
        currentRoute: fetchedRoute,
        passengers: passengers,
      };

      setDriver(driverFromServer);
      console.log('[driver] data loaded from server', driverFromServer);
    } catch (e: any) {
      console.warn('[driver] failed to load data from server', e?.message || e);
      // fallback — оставить mock
      //setDriver(mockData);
    } finally {
      setLoading(false);
    }
  };

  const sendUrgentCall = async (coords?: { latitude: number; longitude: number }) => {
    try {
      const userId = localStorage.getItem('userId');

      // Prefer using loaded driver state which contains bus_schedule id (set in fetchDriverData)
      let busScheduleId: number | undefined = (driver as any)?.id;
      let driverId: number | undefined = undefined;

      // Always fetch driver record to get driver_id from Drivers table
      const driverResp = await api.get(`/drivers/user/${userId}`).then(res => res.data);
      driverId = driverResp.id; // ID from Drivers table
      
      // If driver state not ready, fetch bus schedule
      if (!busScheduleId || !driver) {
        const busId = driverResp.bus_id;
        if (!busId) throw new Error('Bus id not found for driver');
        const schedules = await api.get(`/bus-schedules/bus/${busId}`).then(res => res.data);
        // try to pick the first or second schedule like other code does
        if (Array.isArray(schedules) && schedules.length > 0) {
          busScheduleId = (schedules[1] && schedules[1].id) || schedules[0].id;
        }
      }

      if (!busScheduleId) throw new Error('bus_schedule_id not available');
      if (!driverId) throw new Error('driver_id not available');

      console.log('[driver] sendUrgentCall payload:', { bus_schedule_id: busScheduleId, driver_id: driverId, latitude: coords?.latitude, longitude: coords?.longitude });

      const payload: any = {
        bus_schedule_id: busScheduleId,
        driver_id: driverId,
        latitude: coords?.latitude ?? null,
        longitude: coords?.longitude ?? null,
        accepted: false,
      };

      const res = await api.post('/urgentcalls/create/', payload);
      console.log('[driver] sendUrgentCall response:', res.data);
      return res.data;
    } catch (err) {
      console.error('[driver] sendUrgentCall failed', err);
      throw err;
    }
  };

  const markPassengerPresent = async (passengerId: number) => {
    try {
      await api.patch(`/booking/user/${passengerId}/status`, { status: 'В дороге' });
      setDriver(prev => {
        if (!prev) return null;
        return {
          ...prev,
          passengers: prev.passengers.map(p =>
            p.id === passengerId ? { ...p, isPresent: true, status: 'В дороге' } : p
          ),
        };
      });
    } catch (err: any) {
      console.error('[driver] markPassengerPresent failed', err?.response?.data || err?.message || err);
      alert('Ошибка при отметке присутствия пассажира');
    }
  };

  const reportPassenger = async (passengerId: number, reason = 'Опоздал на посадку') => {
    await new Promise(r => setTimeout(r, 300));
    alert(`Жалоба на пассажира #${passengerId} отправлена\nПричина: ${reason}`);
  };

  const markArrivalAtStop = async (stopId: number) => {
    await new Promise(r => setTimeout(r, 400));
    setDriver(prev => {
      if (!prev?.currentRoute) return prev;
      const now = new Date().toISOString();
      return {
        ...prev,
        currentRoute: {
          ...prev.currentRoute,
          stops: prev.currentRoute.stops.map(s =>
            s.id === stopId ? { ...s, arrivedAt: now } : s
          ),
        },
      };
    });

    try {
      // find stop name
      const stop = driver?.currentRoute?.stops.find(s => s.id === stopId);
      const stopName = stop?.name || '';
      // bus_schedule_id is stored in driver.id (we used scheduleData.id earlier)
      const bus_schedule_id = driver?.id;
      const routeName = `${driver?.currentRoute?.from} - ${driver?.currentRoute?.to}` || '';
      if (bus_schedule_id) {
        // Сохраняем прогресс
        await api.patch(`/bus-schedules/${bus_schedule_id}/visit-stop`, { stopId });

        const res = await api.post('/notifications/arrival/schedule', { bus_schedule_id, routeName, stopName });
        console.log('[driver] notifyArrival response', res.data);
      }
    } catch (err: any) {
      console.error('[driver] notify arrival failed', err?.response?.data || err?.message || err);
    }
  };

  const markAllArrived = async () => {
    await new Promise(r => setTimeout(r, 400));
    setDriver(prev => {
      if (!prev?.currentRoute) return prev;
      const now = new Date().toISOString();
      return {
        ...prev,
        currentRoute: {
          ...prev.currentRoute,
          stops: prev.currentRoute.stops.map((s) => ({ ...s, arrivedAt: s.arrivedAt || now })),
        },
      };
    });
  };

  const sendDelayNotification = async (minutes: number, reason = '') => {
    await new Promise(r => setTimeout(r, 300));
    alert(`Пассажирам отправлено уведомление:\nРейс задерживается на ${minutes} минут.\n${reason ? 'Причина: ' + reason : ''}`);
  };

  const notifyDelaySchedule = async (minutes: number, reason = '') => {
    try {
      const bus_schedule_id = driver?.id;
      const routeName = `${driver?.currentRoute?.from} - ${driver?.currentRoute?.to}` || '';
      if (!bus_schedule_id) throw new Error('bus_schedule_id not available');
      const res = await api.post('/notifications/delay/schedule', { bus_schedule_id, routeName, minutes, reason });
      return res.data;
    } catch (err) {
      console.error('[driver] notifyDelaySchedule failed', err);
      throw err;
    }
  };

  const submitComplaint = async (passengerId: number, complaintText: string) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) throw new Error('User ID not found');

      // Получаем ID водителя из таблицы Drivers
      const driverResp = await api.get(`/drivers/user/${userId}`);
      const driverId = driverResp.data.id;

      const payload = {
        driverId: driverId,
        userId: passengerId,
        complaintText: complaintText
      };

      await api.post('/drivers-complaints/create/', payload);
      console.log('[driver] complaint submitted successfully');
    } catch (err: any) {
      console.error('[driver] submitComplaint failed', err?.response?.data || err?.message || err);
      throw err;
    }
  };

  // Загружаем мок сразу при монтировании
  React.useEffect(() => {
    fetchDriverData();
  }, []);

  return (
    <DriverContext.Provider
      value={{
        driver,
        loading,
        error: null,
        fetchDriverData,
        markPassengerPresent,
        reportPassenger,
        markArrivalAtStop,
        markAllArrived,
        sendDelayNotification,
        notifyDelaySchedule,
        sendUrgentCall,
        submitComplaint,
      }}
    >
      {children}
    </DriverContext.Provider>
  );
};

export default DriverProvider;