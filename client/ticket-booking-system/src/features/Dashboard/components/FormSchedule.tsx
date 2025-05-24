import { useState, useEffect } from 'react';
import AddEntityButton from './AddEntityButton';
import '../styles/css/FormNewEntity.css';
import { useDashboard } from '../context/DashboardContext';
import { ScheduleType } from '../../../shared/types/ScheduleType';
import { z } from 'zod';

interface FormUpdateScheduleProps {
  isOpen: boolean;
  onClose: () => void;
  isActive: boolean;
  schedule?: ScheduleType | null;
}

const scheduleSchema = z.object({
  route_id: z.number().min(1, 'ID маршрута обязателен'),
  departure_time: z
    .string()
    .min(1, 'Время отправления обязательно')
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, 'Неверный формат времени отправления (пример: 14:00:00)'),
  arrival_time: z
    .string()
    .min(1, 'Время прибытия обязательно')
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, 'Неверный формат времени прибытия (пример: 16:00:00)'),
}).refine((data) => {
  const [depHours, depMinutes, depSeconds] = data.departure_time.split(':').map(Number);
  const [arrHours, arrMinutes, arrSeconds] = data.arrival_time.split(':').map(Number);
  const departureInMinutes = depHours * 60 + depMinutes + depSeconds / 60;
  const arrivalInMinutes = arrHours * 60 + arrMinutes + arrSeconds / 60;
  return departureInMinutes < arrivalInMinutes;
}, {
  message: 'Время отправления не может быть позже времени прибытия',
  path: ['arrival_time'],
});

const FormUpdateSchedule: React.FC<FormUpdateScheduleProps> = ({ isOpen, onClose, isActive, schedule }) => {
  const [id, setId] = useState<number | undefined>(undefined);
  const [route_id, setRouteId] = useState<number>(0);
  const [departure_time, setDepartureTime] = useState<string>('');
  const [arrival_time, setArrivalTime] = useState<string>('');
  const [isClosing, setIsClosing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  const { NewSchedule, UpdateSchedule } = useDashboard();

  // Синхронизация состояния формы с пропсом schedule
  useEffect(() => {
    if (schedule && !isActive) {
      setId(schedule.id);
      setRouteId(schedule.route_id || 0);
      // Убедимся, что время в формате HH:mm:ss
      const formatTime = (time: string) => time.replace(/(\d{2}:\d{2}:\d{2}).*/, '$1');
      setDepartureTime(formatTime(schedule.departure_time || ''));
      setArrivalTime(formatTime(schedule.arrival_time || ''));
    } else {
      setId(undefined);
      setRouteId(0);
      setDepartureTime('');
      setArrivalTime('');
    }
  }, [schedule, isActive]);

  // Обработчик для начала закрытия с анимацией
  const handleClose = () => {
    setIsClosing(true);
    setValidationErrors({}); // Очистка ошибок при закрытии
  };

  // Эффект для завершения закрытия после анимации
  useEffect(() => {
    if (isClosing) {
      const timer = setTimeout(() => {
        setIsClosing(false);
        onClose();
      }, 300);
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

  const validateForm = () => {
    const result = scheduleSchema.safeParse({
      route_id,
      departure_time,
      arrival_time,
    });
    if (!result.success) {
      const errors: { [key: string]: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) errors[err.path[0]] = err.message;
      });
      setValidationErrors(errors);
      return false;
    }
    setValidationErrors({});
    return true;
  };

  const handleSubmitAdd = async () => {
    if (!validateForm()) return;
    try {
      await NewSchedule({
        route_id,
        departure_time,
        arrival_time,
      });
      console.log('Расписание успешно добавлено!');
      setError(null);
      handleClose();
    } catch (error) {
      console.error('Ошибка при добавлении расписания:', error);
      setError('Ошибка при добавлении расписания. Попробуйте снова.');
    }
  };

  const handleSubmitUpdate = async () => {
    if (!validateForm()) return;
    try {
      if (id === undefined) throw new Error('ID расписания не определён');
      await UpdateSchedule(id, {
        route_id,
        departure_time,
        arrival_time,
      });
      console.log('Расписание успешно обновлено!');
      setError(null);
      handleClose();
    } catch (error) {
      console.error('Ошибка при обновлении расписания:', error);
      setError('Ошибка при обновлении расписания. Попробуйте снова.');
    }
  };

  const dispatchHandles = (isActive: boolean) => {
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
            e.preventDefault();
            dispatchHandles(isActive);
          }}
        >
          <button type="button" className="modal-close" onClick={handleClose}>
            ×
          </button>
          <div className="form-new-routes__field">
            <input
              type="number"
              value={id ?? ''}
              onChange={(e) => setId(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="ID расписания"
              className={`form-new-routes__input ${isActive ? 'form-new-routes__none' : ''}`}
              required={!isActive}
              disabled={isActive}
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
            {validationErrors.route_id && <span className="form-new-routes__error">{validationErrors.route_id}</span>}
          </div>
          <div className="form-new-routes__field">
            <input
              type="time"
              value={departure_time}
              onChange={(e) => setDepartureTime(e.target.value)}
              step="1" // Указываем шаг в 1 секунду для поддержки секунд
              className="form-new-routes__input"
              required
            />
            {validationErrors.departure_time && <span className="form-new-routes__error">{validationErrors.departure_time}</span>}
          </div>
          <div className="form-new-routes__field">
            <input
              type="time"
              value={arrival_time}
              onChange={(e) => setArrivalTime(e.target.value)}
              step="1" // Указываем шаг в 1 секунду для поддержки секунд
              className="form-new-routes__input"
              required
            />
            {validationErrors.arrival_time && <span className="form-new-routes__error">{validationErrors.arrival_time}</span>}
          </div>
          {error && <p className="form-new-routes__error">{error}</p>}
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