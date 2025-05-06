import { useState, useEffect } from 'react';
import AddEntityButton from './AddEntityButton';
import '../styles/css/FormNewEntity.css'; // Оставляем исходный импорт
import { useDashboard } from '../context/DashboardContext';

interface FormUpdateScheduleProps {
  isOpen: boolean;
  onClose: () => void;
  isActive: boolean;
}

const FormUpdateSchedule: React.FC<FormUpdateScheduleProps> = ({ isOpen, onClose, isActive }) => {
  const [id, setId] = useState(0);
  const [route_id, setRouteId] = useState(0);
  const [departure_time, setDepartureTime] = useState('');
  const [arrival_time, setArrivalTime] = useState('');
  const [isClosing, setIsClosing] = useState(false); // Состояние для анимации закрытия

  const { NewSchedule, UpdateSchedule } = useDashboard();

  // Обработчик для начала закрытия с анимацией
  const handleClose = () => {
    setIsClosing(true);
  };

  // Эффект для завершения закрытия после анимации
  useEffect(() => {
    if (isClosing) {
      const timer = setTimeout(() => {
        setIsClosing(false);
        onClose(); // Вызываем onClose после завершения анимации
      }, 300); // Длительность анимации (соответствует времени в CSS)
      return () => clearTimeout(timer);
    }
  }, [isClosing, onClose]);

  // Эффект для обработки клавиши Escape
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen && !isClosing) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, isClosing]);

  const handleSubmitAdd = async () => {
    try {
      await NewSchedule({
        route_id,
        departure_time,
        arrival_time,
      });
      console.log('Расписание успешно добавлено!');
      handleClose(); // Закрываем с анимацией
    } catch (error) {
      console.error('Ошибка при добавлении расписания:', error);
    }
  };

  const handleSubmitUpdate = async () => {
    try {
      await UpdateSchedule(id, {
        route_id,
        departure_time,
        arrival_time,
      });
      console.log('Расписание успешно обновлено!');
      handleClose(); // Закрываем с анимацией
    } catch (error) {
      console.error('Ошибка при обновлении расписания:', error);
    }
  };

  const dispatchHandles = (isActive: boolean) => {
    console.log(isActive);
    if (isActive) handleSubmitAdd();
    else handleSubmitUpdate();
  };

  if (!isOpen) return null;

  return (
    <div
      className={`modal-overlay ${isClosing ? 'modal-overlay--fade-out' : 'modal-overlay--fade-in'}`}
      onClick={handleClose}
    >
      <div
        className={`modal-content ${isClosing ? 'modal-content--slide-out' : 'modal-content--slide-in'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <form
          className="form-new-routes"
          onSubmit={(e) => {
            e.preventDefault(); // Предотвращаем стандартное поведение формы
            dispatchHandles(isActive);
          }}
        >
          <button type="button" className="modal-close" onClick={handleClose}>
            ×
          </button>
          <div className="form-new-routes__field">
            <input
              type="number"
              value={id}
              onChange={(e) => setId(Number(e.target.value))}
              placeholder="ID расписания"
              className={`form-new-routes__input ${isActive ? 'form-new-routes__none' : ''}`}
              required={!isActive} // Обязательно только для обновления
            />
          </div>
          <div className="form-new-routes__field">
            <input
              type="number"
              value={route_id}
              onChange={(e) => setRouteId(Number(e.target.value))}
              placeholder="ID маршрута"
              className="form-new-routes__input"
              required
            />
          </div>
          <div className="form-new-routes__field">
            <input
              type="time"
              value={departure_time}
              onChange={(e) => setDepartureTime(e.target.value)}
              placeholder="Время отправления"
              className="form-new-routes__input"
              required
            />
          </div>
          <div className="form-new-routes__field">
            <input
              type="time"
              value={arrival_time}
              onChange={(e) => setArrivalTime(e.target.value)}
              placeholder="Время прибытия"
              className="form-new-routes__input"
              required
            />
          </div>
          <div className="form-new-routes__actions">
            <AddEntityButton
              nameButton={isActive ? 'Добавить расписание' : 'Обновить расписание'}
              onClick={async () => dispatchHandles(isActive)}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormUpdateSchedule;