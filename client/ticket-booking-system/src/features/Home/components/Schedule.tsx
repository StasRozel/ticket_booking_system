import React, { useEffect, useState } from 'react';
import '../styles/css/Schedule.css';
import { socket } from '../../..';
import { useHome } from '../context/HomeContext';

const Schedule: React.FC = () => {
  const { busSchedules, loading, error, fetchBusSchedule, booking } = useHome();
  const [trigger, setTrigger] = useState<number>(0);
  socket.on('update', () => {
    setTrigger(next => ++next);
  })

  // eslint-disable-next-line 
  useEffect(() => {
    fetchBusSchedule();
  }, [trigger]);

  const formatTime = (time: string) => time.slice(0, 10);

  return (
    <div className="minibus-schedule">
      <div className="container">
        {loading && <p className="minibus-schedule__loading">Загрузка...</p>}
        {error && <p className="minibus-schedule__error">{error}</p>}
        {!loading && !error && busSchedules.length === 0 ? (
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
                  <th>Купить</th>
                </tr>
              </thead>
              <tbody>
                {busSchedules.map((schedule) => (
                  <tr key={schedule.id}>
                    <td>{schedule.schedule?.route?.name}</td>
                    <td>{formatTime(schedule.schedule?.departure_time as string)}</td>
                    <td>{formatTime(schedule.schedule?.arrival_time as string)}</td>
                    <td>{schedule.operating_days}</td>
                    <td>{`${schedule.bus?.bus_number} (${schedule.bus?.type})`}</td>
                    <td>{schedule.schedule?.route?.price} руб.</td>
                    <td><button className='header__action' onClick={() => booking(schedule)}>Выбрать</button></td>
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