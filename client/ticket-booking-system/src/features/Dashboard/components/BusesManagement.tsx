import React, { useEffect } from 'react';
import '../styles/css/EntitesManagement.css';
import { useDashboard } from '../context/DashboardContext';
import FormUpdateBus from './FormBus';
import ConfirmModal from '../../../shared/components/ConfirmModal';
import { useModal } from '../../../shared/context/ModalContext';

const BusesManagement: React.FC = () => {  
    const { buses, trigger,  fetchBuses, DeleteBus, OpenModalForm, CloseModalForm, isAddMode, isModalFormOpen } = useDashboard();
    const { modalMessage, isModalOpen, openModal, handleModalClose } = useModal();
    // eslint-disable-next-line 
    useEffect(() => {   
        fetchBuses();
    }, [trigger]);

    return (
        <div className="routes-management">
          <h2>BusesManagement</h2>
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
                {buses.map((bus: any) => (
                  <tr key={bus.id}>
                    <td>{bus.id}</td>
                    <td>{bus.bus_number}</td>
                    <td>{bus.capacity.join(', ')} мест</td>
                    <td>{bus.type}</td>
                    <td>{bus.available ? 'Доступен' : 'Недоступен'}</td>
                    <td>
                      <button
                        className="routes-management__action"
                        onClick={() => OpenModalForm(false)}
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
            <div className="routes-management__actions">
            <button className='routes-management__button__confirm' onClick={() => OpenModalForm(true)}>Добавить транспорт</button>
                    <FormUpdateBus
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

export default BusesManagement;