import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/css/Schedule.css';
import { socket } from '../../..';

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

interface MinibusSchedule {
  id: number;
  schedule_id: number;
  bus_id: number;
  operating_days: string;
  schedule: Schedule;
  bus: Bus;
}

const api = axios.create({
  baseURL: 'http://localhost:3001',
});

const Schedule: React.FC = () => {
  const [schedules, setSchedules] = useState<MinibusSchedule[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState<number>(0);
  socket.on('update', () => {
    setTrigger(next => ++next);
})
  // Загрузка данных с бэкенда
  useEffect(() => {
    const fetchSchedules = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get<MinibusSchedule[]>('/bus-schedules/');
        setSchedules(response.data);
      } catch (err) {
        console.error('Ошибка при загрузке расписания:', err);
        setError('Не удалось загрузить расписание. Попробуйте снова.');
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, [trigger]);

  // Форматирование времени (убираем секунды)
  const formatTime = (time: string) => time.slice(0, 5); // HH:mm:ss -> HH:mm

  return (
    <div className="minibus-schedule">
      <div className="container">
        {loading && <p className="minibus-schedule__loading">Загрузка...</p>}
        {error && <p className="minibus-schedule__error">{error}</p>}
        {!loading && !error && schedules.length === 0 ? (
          <p className="minibus-schedule__empty">Расписание отсутствует.</p>
        ) : (
          !loading &&
          !error && (
            <table className="minibus-schedule__table">
              <thead>
                <tr>
                  <th>Маршрут</th>
                  <th>Время отправления</th>
                  <th>Время прибытия</th>
                  <th>Дни работы</th>
                  <th>Автобус</th>
                  <th>Стоимость</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((schedule) => (
                  <tr key={schedule.id}>
                    <td>{schedule.schedule.route.name}</td>
                    <td>{formatTime(schedule.schedule.departure_time)}</td>
                    <td>{formatTime(schedule.schedule.arrival_time)}</td>
                    <td>{schedule.operating_days}</td>
                    <td>{`${schedule.bus.bus_number} (${schedule.bus.type})`}</td>
                    <td>{schedule.schedule.route.price} руб.</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>
    </div>
  );
};

export default Schedule;