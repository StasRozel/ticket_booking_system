import React, { useEffect, useState } from 'react';
import '../styles/css/EntitesManagement.css';
import FormUpdateRoute from './FormRoute';
import { useDashboard } from '../context/DashboardContext';
import ConfirmModal from '../../../shared/components/ConfirmModal';
import { useModal } from '../../../shared/context/ModalContext';
import { RouteType } from '../../../shared/types/RouteType';

const RoutesManagement: React.FC = () => {
    const { routes, trigger, fetchRoutes, deleteEntity, OpenModalForm, CloseModalForm, isAddMode, isModalFormOpen } = useDashboard();
    const { modalMessage, isModalOpen, openModal, handleModalClose } = useModal();
    const [selectedRoute, setSelectedRoute] = useState<RouteType | null>(null);

    useEffect(() => {
        fetchRoutes();
    }, [trigger, fetchRoutes]);

    const handleEditRoute = (route: RouteType) => {
        setSelectedRoute(route);
        OpenModalForm(false);
    };

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
                        {routes.map((route: RouteType) => (
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
                                        onClick={() => handleEditRoute(route)}
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        className="routes-management__action routes-management__action--delete"
                                        onClick={() => openModal('Вы уверены, что хотите удалить путь?', () => deleteEntity('/routes', route.id as number))}
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
                        Добавить маршрут
                    </button>
                </div>
            </div>
            <FormUpdateRoute
                isOpen={isModalFormOpen}
                onClose={CloseModalForm}
                isActive={isAddMode}
                route={selectedRoute}
            />
            <ConfirmModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                message={modalMessage}
            />
        </div>
    );
};

export default RoutesManagement;