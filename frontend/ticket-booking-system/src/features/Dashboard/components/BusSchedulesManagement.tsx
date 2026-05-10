import React, { useEffect, useState } from 'react';
import '../styles/css/BusSchedulesManagement.css';
import FormUpdateBusSchedule from './FormBusSchedule';
import { useDashboard } from '../context/DashboardContext';
import ConfirmModal from '../../../shared/components/ConfirmModal';
import { useModal } from '../../../shared/context/ModalContext';
import { formatDate, formatTime } from '../../../shared/utils/formatDateTime';
import { BusScheduleType } from '../../../shared/types/BusScheduleType';

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
        deleteEntity,
    } = useDashboard();
    const { modalMessage, isModalOpen, openModal, handleModalClose } = useModal();
    const [selectedBusSchedule, setSelectedBusSchedule] = useState<BusScheduleType | null>(null);

    useEffect(() => {
        fetchBusSchedules();
        fetchBuses();
        fetchSchedules();
    }, [trigger, fetchBusSchedules, fetchBuses, fetchSchedules]);

    const handleEditBusSchedule = (busSchedule: BusScheduleType) => {
        setSelectedBusSchedule(busSchedule);
        OpenModalForm(false);
    };

    return (
        <div className="busSchedules-management">
            <h2>Работа с расписанием транспорта</h2>
            <div className="busSchedules-container">
                <div className="busSchedules-tableWrapper">
                    <table className="busSchedules-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Маршрут</th>
                                <th>Время отправления</th>
                                <th>Время прибытия</th>
                                <th>Автобус</th>
                                <th>Дни работы</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {busSchedules.map((bs: BusScheduleType) => {
                                const schedule = bs.schedule || schedules.find((s: any) => s.id === bs.schedule_id);
                                const bus = bs.bus || buses.find((b: any) => b.id === bs.bus_id);
                                const routeName = schedule?.route
                                    ? schedule.route.name
                                    : `#${schedule?.route_id ?? bs.schedule_id}`;

                                return (
                                    <tr key={bs.id}>
                                        <td>{bs.id}</td>
                                        <td>{routeName}</td>
                                        <td>{schedule ? formatTime(schedule.departure_time) : '—'}</td>
                                        <td>{schedule ? formatTime(schedule.arrival_time) : '—'}</td>
                                        <td>{bus ? `${bus.bus_number} (${bus.type})` : `Автобус #${bs.bus_id}`}</td>
                                        <td>{formatDate(bs.operating_days)}</td>
                                        <td>
                                            <button
                                                className="busSchedules-action"
                                                onClick={() => handleEditBusSchedule(bs)}
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="busSchedules-action busSchedules-actionDelete"
                                                onClick={() =>
                                                    openModal(
                                                        'Вы точно хотите удалить движение транспорта по этому пути?',
                                                        () => deleteEntity('/bus-schedules', bs.id as number)
                                                    )
                                                }
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                </div>
            </div>
            <div className="busSchedules-actions">
                <button
                    className="busSchedules-buttonConfirm"
                    onClick={() => OpenModalForm(true)}
                >
                    Добавить расписание транспорта
                </button>
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