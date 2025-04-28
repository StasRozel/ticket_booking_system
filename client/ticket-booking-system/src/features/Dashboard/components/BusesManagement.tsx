import React, { useEffect } from 'react';
import '../styles/css/EntitesManagement.css';
import { useDashboard } from '../context/DashboardContext';
import FormNewBus from './FormNewBus';
import FormUpdateBus from './FormUpdateBus';
import ConfirmModal from '../../../shared/components/ConfirmModal';
import { useModal } from '../../../shared/context/ModalContext';

const BusesManagement: React.FC = () => {  
    const { buses, trigger, is_update, handleEdit, fetchBuses, DeleteBus } = useDashboard();
    const { modalMessage, isModalOpen, openModal, handleModalClose } = useModal();
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
                        onClick={() => openModal('Вы точно хотите удалить транспорт?', () => DeleteBus(bus.id))}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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