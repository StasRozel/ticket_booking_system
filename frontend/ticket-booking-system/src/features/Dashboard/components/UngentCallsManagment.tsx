import React, { useEffect, useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import '../styles/UrgentCalls.scss';

const UrgentCallsManagement: React.FC = () => {
  const { trigger, urgentCalls, fetchUrgentCalls, replaceBusScheduleDriverAndBus, fetchOneBusSchedule, fetchOneDriver } = useDashboard() as any;
  const [selectedSchedule, setSelectedSchedule] = useState<number | null>(null);
  const [driverId, setDriverId] = useState<number | ''>('');
  const [busSchedulesData, setBusSchedulesData] = useState<{ [key: number]: any[] }>({});

  useEffect(() => {
    fetchUrgentCalls();
  }, [trigger]);

  useEffect(() => {
    if (urgentCalls && urgentCalls.length > 0) {
      const fetchData = async () => {
        const data: { [key: number]: any[] } = {};
        await Promise.all(
          urgentCalls.map(async (call: any) => {
            const bsData = await fetchOneBusSchedule(call.busScheduleId);
            const driverData = await fetchOneDriver(call.driverId);
            data[call.id] = [bsData, driverData];
          })
        );
        setBusSchedulesData(data);
      };
      fetchData();
    }
  }, [urgentCalls]);

  const handleReplace = async (call: any) => {
    const bsId = call.busScheduleId;
    const dId = Number(driverId) || call.driverId;
    try {
      await replaceBusScheduleDriverAndBus(bsId, dId, call.id);
      fetchUrgentCalls();
      setDriverId('');
      setSelectedSchedule(null);
    } catch (err) {
      console.error('Replace error', err);
    }
  };

  const getBusScheduleInfo = (callId: number, driverIdFallback: number) => {
    const data = busSchedulesData[callId];
    const bs = data?.[0];
    const driver = data?.[1].user;
    if (bs && bs.schedule) {
      const routeName = bs.schedule.route ? bs.schedule.route.name : `#${bs.schedule.route_id}`;
      const time = `${bs.schedule.departure_time?.slice(0, 5) || ''} - ${bs.schedule.arrival_time?.slice(0, 5) || ''}`;
      const busNumber = bs.bus ? `${bs.bus.bus_number} (${bs.bus.type})` : `#${bs.bus_id}`;
      const driverName = driver ? `${driver.last_name || ''} ${driver.first_name || ''}`.trim() || `#${driverIdFallback}` : `#${driverIdFallback}`;
      return { routeName, time, busNumber, driverName };
    }
    return { routeName: '—', time: '—', busNumber: '—', driverName: '—' };
  };

  return (
    <div className="urgent-calls">
      <h2>Экстренные вызовы</h2>
      <div className="urgent-calls__list">
        {urgentCalls && urgentCalls.length ? (
          urgentCalls.map((call: any) => {
            const bsInfo = getBusScheduleInfo(call.id, call.driverId);
            return (
              <div key={call.id} className="urgent-calls__item">
                <div className="urgent-calls__info">
                  <div className="urgent-calls__info-item">
                    <label>ID вызова</label>
                    <span>{call.id}</span>
                  </div>
                  <div className="urgent-calls__info-item">
                    <label>Маршрут</label>
                    <span>{bsInfo.routeName}</span>
                  </div>
                  <div className="urgent-calls__info-item">
                    <label>Время</label>
                    <span>{bsInfo.time}</span>
                  </div>
                  <div className="urgent-calls__info-item">
                    <label>Автобус</label>
                    <span>{bsInfo.busNumber}</span>
                  </div>
                  <div className="urgent-calls__info-item">
                    <label>Водитель</label>
                    <span>{bsInfo.driverName}</span>
                  </div>
                  <div className="urgent-calls__info-item">
                    <label>Геолокация</label>
                    <span>{call.latitude}, {call.longitude}</span>
                  </div>
                  <div className="urgent-calls__info-item">
                    <label>Статус</label>
                    <span className={`urgent-calls__status ${call.accepted ? 'urgent-calls__status--accepted' : 'urgent-calls__status--pending'}`}>
                      {call.accepted ? 'Принят' : 'Ожидание'}
                    </span>
                  </div>
                </div>

                <div className="urgent-calls__actions">
                  {!call.accepted && (
                    <button onClick={() => setSelectedSchedule(call.id)}>
                      Изменить водителя
                    </button>
                  )}
                  {selectedSchedule === call.id && (
                    <div className="urgent-calls__replace-form">
                      <input 
                        type="number"
                        placeholder="ID водителя" 
                        value={driverId as any} 
                        onChange={e => setDriverId(e.target.value ? Number(e.target.value) : '')} 
                      />
                      <button className="apply" onClick={() => handleReplace(call)}>Применить</button>
                      <button className="cancel" onClick={() => setSelectedSchedule(null)}>Отмена</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="urgent-calls__empty">Нет экстренных вызовов</div>
        )}
      </div>
    </div>
  );
};

export default UrgentCallsManagement;