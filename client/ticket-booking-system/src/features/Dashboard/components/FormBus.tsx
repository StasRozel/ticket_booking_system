import { useState, useEffect } from 'react';
import AddEntityButton from './AddEntityButton';
import '../styles/css/FormNewEntity.css'; // Сохраняем исходный импорт
import { useDashboard } from '../context/DashboardContext';

interface FormUpdateBusProps {
  isOpen: boolean;
  onClose: () => void;
  isActive: boolean;
}

const FormUpdateBus: React.FC<FormUpdateBusProps> = ({ isOpen, onClose, isActive }) => {
  const [id, setId] = useState(0);
  const [busNumber, setBusNumber] = useState<string>('');
  const [capacity, setCapacity] = useState<any>(null);
  const [type, setType] = useState<string>('');
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [isClosing, setIsClosing] = useState(false); // Состояние для анимации закрытия
  const [error, setError] = useState<string | null>(null);

  const { NewBus, UpdateBus } = useDashboard();

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
      await NewBus({
        bus_number: busNumber,
        capacity,
        type,
        available: isAvailable,
      });
      console.log('Автобус успешно добавлен!');
      setError(null);
      // Очищаем форму после успешной отправки
      setBusNumber('');
      setCapacity(0);
      setType('');
      setIsAvailable(false);
      handleClose(); // Закрываем с анимацией
    } catch (error) {
      console.error('Ошибка при добавлении автобуса:', error);
      setError('Ошибка при добавлении автобуса. Попробуйте снова.');
    }
  };

  const handleSubmitUpdate = async () => {
    try {
      await UpdateBus(id, {
        bus_number: busNumber,
        capacity,
        type,
        available: isAvailable,
      });
      console.log('Автобус успешно обновлён!');
      handleClose(); // Закрываем с анимацией
    } catch (error) {
      console.error('Ошибка при обновлении автобуса:', error);
      setError('Ошибка при обновлении автобуса. Попробуйте снова.');
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
              placeholder="ID автобуса"
              className={`form-new-routes__input ${isActive ? 'form-new-routes__none' : ''}`}
              required={!isActive} // Обязательно только для обновления
            />
          </div>
          <div className="form-new-routes__field">
            <input
              type="text"
              value={busNumber}
              onChange={(e) => setBusNumber(e.target.value)}
              placeholder="Номер автобуса"
              className="form-new-routes__input"
              required
            />
          </div>
          <div className="form-new-routes__field">
            <input
              type="string"
              value={capacity || ''} // Чтобы избежать "0" в инпуте
              onChange={(e) => setCapacity(capacity.split(','))} //TODO переделать
              placeholder="Вместимость (мест)"
              className="form-new-routes__input"
              required
            />
          </div>
          <div className="form-new-routes__field">
            <input
              type="text"
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="Тип автобуса"
              className="form-new-routes__input"
              required
            />
          </div>
          <div className="form-new-routes__field">
            <label className="form-new-routes__checkbox-label">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="form-new-routes__checkbox"
              />
              Доступен
            </label>
          </div>
          {error && <p className="form-new-routes__error">{error}</p>}
          <div className="form-new-routes__actions">
            <AddEntityButton
              nameButton={isActive ? 'Добавить автобус' : 'Обновить автобус'}
              onClick={async () => dispatchHandles(isActive)}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormUpdateBus;