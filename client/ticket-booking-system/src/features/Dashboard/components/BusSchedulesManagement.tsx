import React, { useEffect } from 'react';
import styles from '../styles/css/BusSchedulesManagement.css'; // Импорт модульных стилей как объекта
import FormUpdateBusSchedule from './FormBusSchedule';
import { useDashboard } from '../context/DashboardContext';
import ConfirmModal from '../../../shared/components/ConfirmModal';
import { useModal } from '../../../shared/context/ModalContext';
import { formatDate, formatTime } from '../../../shared/services/formatDateTime';

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
    DeleteBusSchedule,
  } = useDashboard();
  const { modalMessage, isModalOpen, openModal, handleModalClose } = useModal();

  // eslint-disable-next-line
  useEffect(() => {
    fetchBusSchedules();
    fetchBuses();
    fetchSchedules();
  }, [trigger]);

  return (
    <div className={styles.routesManagement}>
      <h2>BusSchedulesManagement</h2>
      <div className={styles.routesManagementActions}>
        <button
          className={styles.routesManagementButtonConfirm}
          onClick={() => OpenModalForm(true)}
        >
          Добавить расписание транспорта
        </button>
        <FormUpdateBusSchedule
          isOpen={isModalFormOpen}
          onClose={CloseModalForm}
          isActive={isAddMode}
        />
      </div>
      <div className={styles.container}>
        <table className={`${styles.routesManagementTable} ${styles.tableBusschedules}`}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Schedule ID</th>
              <th>Bus ID</th>
              <th>Operating Days</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {busSchedules.map((route: any) => (
              <tr key={route.id}>
                <td>{route.id}</td>
                <td>{route.schedule_id}</td>
                <td>{route.bus_id}</td>
                <td>{formatDate(route.operating_days)}</td>
                <td>
                  <button
                    className={styles.routesManagementAction}
                    onClick={() => OpenModalForm(false)}
                  >
                    ✏️
                  </button>
                  <button
                    className={`${styles.routesManagementAction} ${styles.routesManagementActionDelete}`}
                    onClick={() =>
                      openModal(
                        'Вы точно хотите удалить движение транспорта по этому пути?',
                        () => DeleteBusSchedule(route.id)
                      )
                    }
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <table className={`${styles.routesManagementTable} ${styles.tableBuses}`}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Номер автобуса</th>
              <th>Вместимость</th>
              <th>Тип</th>
              <th>Доступность</th>
            </tr>
          </thead>
          <tbody>
            {buses.map((bus: any) => (
              <tr key={bus.id}>
                <td>{bus.id}</td>
                <td>{bus.bus_number}</td>
                <td>{bus.capacity.join(', ')}</td>
                <td>{bus.type}</td>
                <td>{bus.available ? 'Доступен' : 'Недоступен'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <table className={`${styles.routesManagementTable} ${styles.tableSchedules}`}>
          <thead>
            <tr>
              <th>ID</th>
              <th>ID маршрута</th>
              <th>Время отправки</th>
              <th>Время прибытия</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((schedule: any) => (
              <tr key={schedule.id}>
                <td>{schedule.id}</td>
                <td>{schedule.route_id}</td>
                <td>{formatTime(schedule.departure_time)}</td>
                <td>{formatTime(schedule.arrival_time)}</td>
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

export default BusSchedulesManagement;