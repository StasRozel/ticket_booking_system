import { useState, useEffect } from 'react';
import AddEntityButton from './AddEntityButton';
import '../styles/css/FormNewEntity.css';
import { useDashboard } from '../context/DashboardContext';
import { ScheduleType } from '../../../shared/types/ScheduleType'; // Предполагается, что тип ScheduleType определён

interface FormUpdateScheduleProps {
    isOpen: boolean;
    onClose: () => void;
    isActive: boolean;
    schedule?: ScheduleType | null;
}

const FormUpdateSchedule: React.FC<FormUpdateScheduleProps> = ({ isOpen, onClose, isActive, schedule }) => {
    const [id, setId] = useState<number | undefined>(undefined);
    const [route_id, setRouteId] = useState<number>(0);
    const [departure_time, setDepartureTime] = useState<string>('');
    const [arrival_time, setArrivalTime] = useState<string>('');
    const [isClosing, setIsClosing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { NewSchedule, UpdateSchedule } = useDashboard();

    // Синхронизация состояния формы с пропсом schedule
    useEffect(() => {
        if (schedule && !isActive) {
            setId(schedule.id);
            setRouteId(schedule.route_id || 0);
            setDepartureTime(schedule.departure_time ? new Date(schedule.departure_time).toISOString().slice(11, 16) : '');
            setArrivalTime(schedule.arrival_time ? new Date(schedule.arrival_time).toISOString().slice(11, 16) : '');
        } else {
            // Сбрасываем состояние для режима добавления
            setId(undefined);
            setRouteId(0);
            setDepartureTime('');
            setArrivalTime('');
        }
    }, [isActive]);

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

    const handleSubmitAdd = async () => {
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