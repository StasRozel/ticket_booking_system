import { useState, useEffect } from 'react';
import AddEntityButton from './AddEntityButton';
import '../styles/css/FormNewEntity.css';
import { useDashboard } from '../context/DashboardContext';
import { BusType } from '../../../shared/types/BusType'; // Предполагается, что тип BusType определён
import { z } from 'zod';

interface FormUpdateBusProps {
    isOpen: boolean;
    onClose: () => void;
    isActive: boolean;
    bus?: BusType | null;
}

// Схема валидации
const busSchema = z.object({
    busNumber: z.string().min(1, 'Номер автобуса обязателен'),
    capacity: z.number().min(1, 'Вместимость должна быть больше 0'),
    type: z.string().min(1, 'Тип автобуса обязателен'),
    isAvailable: z.boolean(),
});

const FormUpdateBus: React.FC<FormUpdateBusProps> = ({ isOpen, onClose, isActive, bus }) => {
    const [id, setId] = useState<number | undefined>(undefined);
    const [busNumber, setBusNumber] = useState<string>('');
    const [capacity, setCapacity] = useState<number>(0);
    const [type, setType] = useState<string>('');
    const [isAvailable, setIsAvailable] = useState<boolean>(false);
    const [isClosing, setIsClosing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

    const { NewBus, UpdateBus } = useDashboard();

    // Синхронизация состояния формы с пропсом bus
    useEffect(() => {
        if (bus && !isActive) {
            setId(bus.id);
            setBusNumber(bus.bus_number || '');
            setCapacity(bus.capacity?.[0] || 0); // Берём первый элемент массива capacity
            setType(bus.type || '');
            setIsAvailable(bus.available || false);
        } else {
            // Сбрасываем состояние для режима добавления
            setId(undefined);
            setBusNumber('');
            setCapacity(0);
            setType('');
            setIsAvailable(false);
        }
    }, [bus, isActive]);

    // Обработчик для начала закрытия с анимацией
    const handleClose = () => {
        setIsClosing(true);
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
        const result = busSchema.safeParse({
            busNumber,
            capacity,
            type,
            isAvailable,
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
            await NewBus({
                bus_number: busNumber,
                capacity: [capacity],
                type,
                available: isAvailable,
            });
            console.log('Автобус успешно добавлен!');
            setError(null);
            handleClose();
        } catch (error) {
            console.error('Ошибка при добавлении автобуса:', error);
            setError('Ошибка при добавлении автобуса. Попробуйте снова.');
        }
    };

    const handleSubmitUpdate = async () => {
        if (!validateForm()) return;
        try {
            if (id === undefined) throw new Error('ID автобуса не определён');
            await UpdateBus(id, {
                bus_number: busNumber,
                capacity: [capacity],
                type,
                available: isAvailable,
            });
            console.log('Автобус успешно обновлён!');
            setError(null);
            handleClose();
        } catch (error) {
            console.error('Ошибка при обновлении автобуса:', error);
            setError('Ошибка при обновлении автобуса. Попробуйте снова.');
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
                            placeholder="ID автобуса"
                            className={`form-new-routes__input ${isActive ? 'form-new-routes__none' : ''}`}
                            required={!isActive}
                            disabled={isActive}
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
                        {validationErrors.busNumber && <span className="form-new-routes__error">{validationErrors.busNumber}</span>}
                    </div>
                    <div className="form-new-routes__field">
                        <input
                            type="number"
                            value={capacity}
                            onChange={(e) => setCapacity(Number(e.target.value))}
                            placeholder="Вместимость (мест)"
                            className="form-new-routes__input"
                            required
                        />
                        {validationErrors.capacity && <span className="form-new-routes__error">{validationErrors.capacity}</span>}
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
                        {validationErrors.type && <span className="form-new-routes__error">{validationErrors.type}</span>}
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