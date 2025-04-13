import React, { useEffect } from 'react';
import '../styles/css/RoutesManagement.css';
import FormNewBusSchedule from './FormNewBusSchedule';
import FormUpdateBusSchedule from './FormUpdateBusSchedule';
import { useDashboard } from '../context/DashboardContext';

const BusSchedulesManagement: React.FC = () => {
    const { buses, schedules, busSchedules, trigger, is_update, handleEdit, fetchBusSchedules, fetchBuses, fetchSchedules, DeleteBusSchedule } = useDashboard();

    // eslint-disable-next-line 
    useEffect(() => {
        fetchBusSchedules();
        fetchBuses();
        fetchSchedules();
    }, [trigger]);

    return (
        <div className="routes-management">
            <h2>BusSchedulesManagement</h2>
            <div className="container">
                <div className="routes-management__actions">
                    {!is_update ? <FormNewBusSchedule /> : <FormUpdateBusSchedule />}
                </div>
                <table className="routes-management__table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Schedule ID</th>
                            <th>Bus ID</th>
                            <th>Operating Days</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {busSchedules.map((route: any) => (
                            <tr key={route.id}>
                                <td>{route.id}</td>
                                <td>{route.schedule_id}</td>
                                <td>{route.bus_id}</td>
                                <td>{route.operating_days}</td>
                                <td>
                                    <button
                                        className="routes-management__action"
                                        onClick={() => handleEdit()}
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        className="routes-management__action routes-management__action--delete"
                                        onClick={() => DeleteBusSchedule(route.id)}
                                    >
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <table className="routes-management__table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Номер автобуса</th>
                            <th>Вместимость</th>
                            <th>Тип</th>
                            <th>Доступность</th>
                        </tr>
                    </thead>
                    <tbody>
                        {buses.map((bus: any) => (
                            <tr key={bus.id}>
                                <td>{bus.id}</td>
                                <td>{bus.bus_number}</td>
                                <td>{bus.capacity} мест</td>
                                <td>{bus.type}</td>
                                <td>{bus.available ? 'Доступен' : 'Недоступен'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <table className="routes-management__table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>ID маршрута</th>
                            <th>Время отправки</th>
                            <th>Время пребытия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {schedules.map((schedule: any) => (
                            <tr key={schedule.id}>
                                <td>{schedule.id}</td>
                                <td>{schedule.route_id}</td>
                                <td>{schedule.departure_time} км</td>
                                <td>{schedule.arrival_time} руб.</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BusSchedulesManagement;