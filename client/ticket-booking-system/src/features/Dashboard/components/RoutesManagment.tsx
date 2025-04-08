import React, { useEffect } from 'react';
import '../styles/css/RoutesManagement.css';
import FormNewEntity from './FormNewEntity';
import FormUpdateEntity from './FormUpdateEntity';
import { useDashboard } from '../context/DashboardContext';

let IS_UPDATE = false;

const handleEdit = async () => {
    IS_UPDATE = true;
};

const RoutesManagement: React.FC = () => {  
    const { routes, trigger, is_update, handleEdit, fetchRoutes, DeleteRoute } = useDashboard();

    // eslint-disable-next-line 
    useEffect(() => {   
        fetchRoutes();
    }, [trigger]);

    return (
        <div className="routes-management">
            <h2>Работа с маршрутами</h2>
            <div className="container">
                <div className="routes-management__actions">
                    {!is_update ? <FormNewEntity /> : <FormUpdateEntity />}
                </div>
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
                                        onClick={() => handleEdit()}
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        className="routes-management__action routes-management__action--delete"
                                        onClick={() => DeleteRoute(route.id)}
                                    >
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RoutesManagement;