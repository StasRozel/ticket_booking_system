import React, { useEffect, useState } from 'react';
import '../styles/css/EntitesManagement.css';
import { useDashboard } from '../context/DashboardContext';
import FormUpdateSchedule from './FormSchedule';
import ConfirmModal from '../../../shared/components/ConfirmModal';
import { useModal } from '../../../shared/context/ModalContext';
import { formatTime } from '../../../shared/utils/formatDateTime';
import { ScheduleType } from '../../../shared/types/ScheduleType'; // Предполагается, что тип ScheduleType определён

const SchedulesManagement: React.FC = () => {
    const { schedules, trigger, fetchSchedules, deleteEntity, OpenModalForm, isAddMode, isModalFormOpen, CloseModalForm } = useDashboard();
    const { modalMessage, isModalOpen, openModal, handleModalClose } = useModal();
    const [selectedSchedule, setSelectedSchedule] = useState<ScheduleType | null>(null);

    useEffect(() => {
        fetchSchedules();
    }, [trigger, fetchSchedules]);

    const handleEditSchedule = (schedule: ScheduleType) => {
        setSelectedSchedule(schedule);
        OpenModalForm(false); // Открываем форму в режиме редактирования
    };

    return (
        <div className="routes-management">
            <h2>Работа с расписанием</h2>
            <div className="container">
                <table className="routes-management__table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>ID маршрута</th>
                            <th>Время отправки</th>
                            <th>Время пребытия</th>
                            <th>Редактирование</th>
                        </tr>
                    </thead>
                    <tbody>
                        {schedules.map((schedule: ScheduleType) => (
                            <tr key={schedule.id}>
                                <td>{schedule.id}</td>
                                <td>{schedule.route_id}</td>
                                <td>{formatTime(schedule.departure_time)}</td>
                                <td>{formatTime(schedule.arrival_time)}</td>
                                <td>
                                    <button
                                        className="routes-management__action"
                                        onClick={() => handleEditSchedule(schedule)}
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        className="routes-management__action routes-management__action--delete"
                                        onClick={() => openModal('Вы точно хотите удалить расписание?', () => deleteEntity('/schedules', schedule.id as number))}
                                    >
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="routes-management__actions">
                    <button className="routes-management__button__confirm" onClick={() => OpenModalForm(true)}>
                        Добавить расписание
                    </button>
                </div>
                <FormUpdateSchedule
                    isOpen={isModalFormOpen}
                    onClose={CloseModalForm}
                    isActive={isAddMode}
                    schedule={selectedSchedule}
                />
            </div>
            <ConfirmModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                message={modalMessage}
            />
        </div>
    );
};

export default SchedulesManagement;