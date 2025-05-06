import React, { useState, useEffect } from 'react';
import AddEntityButton from './AddEntityButton';
import '../styles/css/FormNewEntity.css'; // Переключаем на SCSS, где уже есть стили модального окна
import { useDashboard } from '../context/DashboardContext';

interface FormUpdateBusScheduleProps {
  isOpen: boolean;
  onClose: () => void;
  isActive: boolean;
}

const FormUpdateBusSchedule: React.FC<FormUpdateBusScheduleProps> = ({ isOpen, onClose, isActive }) => {
  const [id, setId] = useState(0);
  const [schedule_id, setScheduleId] = useState<number>(0);
  const [bus_id, setBusId] = useState<number>(0);
  const [operating_days, setOperatingDays] = useState<string>('');
  const [isClosing, setIsClosing] = useState(false); // Состояние для анимации закрытия

  const { NewBusSchedule, UpdateBusSchedule } = useDashboard();

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
      }, 300); // Длительность анимации (соответствует времени в SCSS)
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
      await NewBusSchedule({
        schedule_id,
        bus_id,
        operating_days,
      });
      console.log('Автобус успешно добавлен!');
      handleClose(); // Закрываем с анимацией
    } catch (error) {
      console.error('Ошибка при добавлении автобуса:', error);
    }
  };

  const handleSubmitUpdate = async () => {
    try {
      await UpdateBusSchedule(id, {
        schedule_id,
        bus_id,
        operating_days,
      });
      console.log('Автобус успешно обновлён!');
      handleClose(); // Закрываем с анимацией
    } catch (error) {
      console.error('Ошибка при обновлении автобуса:', error);
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
              value={schedule_id}
              onChange={(e) => setScheduleId(Number(e.target.value))}
              placeholder="ID маршрута"
              className="form-new-routes__input"
              required
            />
          </div>
          <div className="form-new-routes__field">
            <input
              type="number"
              value={bus_id}
              onChange={(e) => setBusId(Number(e.target.value))}
              placeholder="ID автобуса"
              className="form-new-routes__input"
              required
            />
          </div>
          <div className="form-new-routes__field">
            <input
              type="text"
              value={operating_days}
              onChange={(e) => setOperatingDays(e.target.value)}
              placeholder="Дни работы (например, 01.01.2025)"
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

export default FormUpdateBusSchedule;