import React, { useEffect } from 'react';
import '../styles/css/EntitesManagement.css';
import FormUpdateRoute from './FormRoute';
import { useDashboard } from '../context/DashboardContext';
import ConfirmModal from '../../../shared/components/ConfirmModal';
import { useModal } from '../../../shared/context/ModalContext';

const RoutesManagement: React.FC = () => {
    const { routes, trigger, fetchRoutes, DeleteRoute, OpenModalForm, CloseModalForm, isAddMode, isModalFormOpen } = useDashboard();
    const { modalMessage, isModalOpen, openModal, handleModalClose } = useModal();
    // eslint-disable-next-line 
    useEffect(() => {
        fetchRoutes();
    }, [trigger]);

    return (
        <div className="routes-management">
            <h2>Работа с маршрутами</h2>

            <div className="container">
                <table className="routes-management__table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Название маршрута</th>
                            <th>Маршрут</th>
                            <th>Промежуточные остановки</th>
                            <th>Расстояние</th>
                            <th>Стоимость</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {routes.map((route: any) => (
                            <tr key={route.id}>
                                <td>{route.id}</td>
                                <td>{route.name}</td>
                                <td>{`${route.starting_point} → ${route.ending_point}`}</td>
                                <td>{route.stops ? route.stops : 'Нет остановок'}</td>
                                <td>{route.distance} км</td>
                                <td>{route.price} руб.</td>
                                <td>
                                    <button
                                        className="routes-management__action"
                                        onClick={() => OpenModalForm(false)}
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        className="routes-management__action routes-management__action--delete"
                                        onClick={() => openModal('Вы уверены, что хотите удалить путь?', () => DeleteRoute(route.id))}
                                    >
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="routes-management__actions">
                    <button className='routes-management__button__confirm' onClick={() => OpenModalForm(true)}>Добавить маршрут</button>
                    <FormUpdateRoute
                        isOpen={isModalFormOpen}
                        onClose={CloseModalForm}
                        isActive={isAddMode}
                    />
                </div>
            </div>
            <ConfirmModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                message={modalMessage}
            />
        </div>
    );
};

export default RoutesManagement;