import React, { useEffect, useState } from 'react';
import '../styles/css/BusSchedulesManagement.css';
import FormUpdateBusSchedule from './FormBusSchedule';
import { useDashboard } from '../context/DashboardContext';
import ConfirmModal from '../../../shared/components/ConfirmModal';
import { useModal } from '../../../shared/context/ModalContext';
import { formatDate, formatTime } from '../../../shared/services/formatDateTime';
import { BusScheduleType } from '../../../shared/types/BusScheduleType'; // Предполагается, что тип BusScheduleType определён
import { BusType } from '../../../shared/types/BusType'; // Предполагается, что тип BusType определён
import { ScheduleType } from '../../../shared/types/ScheduleType'; // Предполагается, что тип ScheduleType определён

const BusSchedulesManagement: React.FC = () => {
    const {
        buses,
        schedules,
        busSchedules,
        trigger,
        isModalFormOpen,
        isAddMode,
        OpenModalForm,
        CloseModalForm,
        fetchBusSchedules,
        fetchBuses,
        fetchSchedules,
        DeleteBusSchedule,
    } = useDashboard();
    const { modalMessage, isModalOpen, openModal, handleModalClose } = useModal();
    const [selectedBusSchedule, setSelectedBusSchedule] = useState<BusScheduleType | null>(null);

    useEffect(() => {
        fetchBusSchedules();
        fetchBuses();
        fetchSchedules();
    }, [trigger]);

    const handleEditBusSchedule = (busSchedule: BusScheduleType) => {
        setSelectedBusSchedule(busSchedule);
        OpenModalForm(false); // Открываем форму в режиме редактирования
    };

    return (
        <div className="busSchedules-management">
            <h2>BusSchedulesManagement</h2>
            <div className="busSchedules-actions">
                <button
                    className="busSchedules-buttonConfirm"
                    onClick={() => OpenModalForm(true)}
                >
                    Добавить расписание транспорта
                </button>
            </div>
            <div className="busSchedules-container">
                <table className="busSchedules-table busSchedules-tableBusschedules">
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
                        {busSchedules.map((route: BusScheduleType) => (
                            <tr key={route.id}>
                                <td>{route.id}</td>
                                <td>{route.schedule_id}</td>
                                <td>{route.bus_id}</td>
                                <td>{formatDate(route.operating_days)}</td>
                                <td>
                                    <button
                                        className="busSchedules-action"
                                        onClick={() => handleEditBusSchedule(route)}
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        className="busSchedules-action busSchedules-actionDelete"
                                        onClick={() =>
                                            openModal(
                                                'Вы точно хотите удалить движение транспорта по этому пути?',
                                                () => DeleteBusSchedule(route.id as number)
                                            )
                                        }
                                    >
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <table className="busSchedules-table busSchedules-tableBuses">
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
                        {buses.map((bus: BusType) => (
                            <tr key={bus.id}>
                                <td>{bus.id}</td>
                                <td>{bus.bus_number}</td>
                                <td>{bus.capacity.join(', ')}</td>
                                <td>{bus.type}</td>
                                <td>{bus.available ? 'Доступен' : 'Недоступен'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <table className="busSchedules-table busSchedules-tableSchedules">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>ID маршрута</th>
                            <th>Время отправки</th>
                            <th>Время прибытия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {schedules.map((schedule: ScheduleType) => (
                            <tr key={schedule.id}>
                                <td>{schedule.id}</td>
                                <td>{schedule.route_id}</td>
                                <td>{formatTime(schedule.departure_time)}</td>
                                <td>{formatTime(schedule.arrival_time)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <FormUpdateBusSchedule
                isOpen={isModalFormOpen}
                onClose={CloseModalForm}
                isActive={isAddMode}
                busSchedule={selectedBusSchedule}
            />
            <ConfirmModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                message={modalMessage}
            />
        </div>
    );
};

export default BusSchedulesManagement;