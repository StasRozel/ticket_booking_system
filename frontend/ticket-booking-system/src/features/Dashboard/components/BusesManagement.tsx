import React, { useEffect } from 'react';
import '../styles/css/EntitesManagement.css';
import { useDashboard } from '../context/DashboardContext';
import FormUpdateBus from './FormBus';
import ConfirmModal from '../../../shared/components/ConfirmModal';
import { useModal } from '../../../shared/context/ModalContext';
import { BusType } from '../../../shared/types/BusType'; 

const BusesManagement: React.FC = () => {
    const { buses, trigger, fetchBuses, deleteEntity, OpenModalForm, CloseModalForm, isAddMode, isModalFormOpen, currentEntity } = useDashboard();
    const { modalMessage, isModalOpen, openModal, handleModalClose } = useModal();

    useEffect(() => {
        fetchBuses();
    }, [trigger, fetchBuses]);

    const handleEditBus = (bus: BusType) => {
        OpenModalForm(false, bus);
    };

    return (
        <div className="routes-management">
            <h2>Работа с транспортом</h2>
            <div className="container">
                <table className="routes-management__table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Номер автобуса</th>
                            <th>Вместимость</th>
                            <th>Тип</th>
                            <th>Доступность</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {buses.map((bus: BusType) => (
                            <tr key={bus.id}>
                                <td>{bus.id}</td>
                                <td>{bus.bus_number}</td>
                                <td>{bus.capacity.length ? `${bus.capacity.join(', ') } мест    ` : 'мест нет'}</td>
                                <td>{bus.type}</td>
                                <td>{bus.available ? 'Доступен' : 'Недоступен'}</td>
                                <td>
                                    <button
                                        className="routes-management__action"
                                        onClick={() => handleEditBus(bus)}
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        className="routes-management__action routes-management__action--delete"
                                        onClick={() => openModal('Вы точно хотите удалить транспорт?', () => deleteEntity('/buses', bus.id as number))}
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
                        Добавить транспорт
                    </button>
                </div>
                <FormUpdateBus
                    isOpen={isModalFormOpen}
                    onClose={CloseModalForm}
                    isActive={isAddMode}
                    bus={currentEntity}
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

export default BusesManagement;