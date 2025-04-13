import React, { useEffect } from 'react';
import '../styles/css/RoutesManagement.css';
import { useDashboard } from '../context/DashboardContext';
import FormNewBus from './FormNewBus';
import FormUpdateBus from './FormUpdateBus';

const BusesManagement: React.FC = () => {  
    const { buses, trigger, is_update, handleEdit, fetchBuses, DeleteBus } = useDashboard();

    // eslint-disable-next-line 
    useEffect(() => {   
        fetchBuses();
    }, [trigger]);

    return (
        <div className="routes-management">
          <h2>BusesManagement</h2>
          <div className="container">
            <div className="routes-management__actions">
              {!is_update ? <FormNewBus /> : <FormUpdateBus />}
            </div>
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
                {buses.map((bus: any) => (
                  <tr key={bus.id}>
                    <td>{bus.id}</td>
                    <td>{bus.bus_number}</td>
                    <td>{bus.capacity} мест</td>
                    <td>{bus.type}</td>
                    <td>{bus.available ? 'Доступен' : 'Недоступен'}</td>
                    <td>
                      <button
                        className="routes-management__action"
                        onClick={() => handleEdit()}
                      >
                        ✏️
                      </button>
                      <button
                        className="routes-management__action routes-management__action--delete"
                        onClick={() => DeleteBus(bus.id)}
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

export default BusesManagement;