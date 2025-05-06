import React, { useEffect } from 'react';
import '../styles/css/EntitesManagement.css';
import { useDashboard } from '../context/DashboardContext';
import FormUpdateSchedule from './FormSchedule';
import ConfirmModal from '../../../shared/components/ConfirmModal';
import { useModal } from '../../../shared/context/ModalContext';
import { formatTime } from '../../../shared/services/formatDateTime';


const SchedulesManagement: React.FC = () => {
  const { schedules, trigger, fetchSchedules, DeleteSchedule, OpenModalForm, isAddMode, isModalFormOpen, CloseModalForm } = useDashboard();
  const { modalMessage, isModalOpen, openModal, handleModalClose } = useModal();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {   
    fetchSchedules();
  }, [trigger]);

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
                      {schedules.map((schedule: any) => (
                          <tr key={schedule.id}>
                              <td>{schedule.id}</td>
                              <td>{schedule.route_id}</td>
                              <td>{formatTime(schedule.departure_time)}</td>
                              <td>{formatTime(schedule.arrival_time)}</td>
                              <td>
                                  <button
                                      className="routes-management__action"
                                      onClick={() => OpenModalForm(false)}
                                  >
                                      ✏️
                                  </button>
                                  <button
                                      className="routes-management__action routes-management__action--delete"
                                      onClick={() => openModal('Вы точно хотите удалить расписание?', () => DeleteSchedule(schedule.id))}
                                  >
                                      🗑️
                                  </button>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
              <div className="routes-management__actions">
              <button className='routes-management__button__confirm' onClick={() => OpenModalForm(true)}>Добавить расписание</button>
                    <FormUpdateSchedule
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

export default SchedulesManagement;