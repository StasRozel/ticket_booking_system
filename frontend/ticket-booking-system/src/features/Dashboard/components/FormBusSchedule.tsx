import React, { useState, useEffect } from 'react';
import AddEntityButton from './AddEntityButton';
import '../styles/css/FormNewEntity.css';
import { useDashboard } from '../context/DashboardContext';
import { BusScheduleType, BusScheduleResponse } from '../../../shared/types/BusScheduleType';
import { z } from 'zod';

interface FormUpdateBusScheduleProps {
    isOpen: boolean;
    onClose: () => void;
    isActive: boolean;
    busSchedule?: BusScheduleType | null;
}

const busScheduleSchema = z.object({
    schedule_id: z.coerce.number().min(1, 'ID расписания обязателен'),
    bus_id: z.coerce.number().min(1, 'ID автобуса обязателен'),
    operating_days: z
        .string()
        .min(1, 'Дата обязательна')
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Дата должна быть в формате YYYY-MM-DD'),
});

const FormUpdateBusSchedule: React.FC<FormUpdateBusScheduleProps> = ({ isOpen, onClose, isActive, busSchedule }) => {
    const [id, setId] = useState<number | undefined>(undefined);
    const [schedule_id, setScheduleId] = useState<number>(0);
    const [bus_id, setBusId] = useState<number>(0);
    const [operating_days, setOperatingDays] = useState<string>('');
    const [isClosing, setIsClosing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

    const { NewBusSchedule, UpdateBusSchedule } = useDashboard();

    // Получить сегодняшнюю дату в формате YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];

    // Синхронизация состояния формы с пропсом busSchedule
    useEffect(() => {
        if (busSchedule && !isActive) {
            setId(busSchedule.id);
            setScheduleId(busSchedule.schedule_id || 0);
            setBusId(busSchedule.bus_id || 0);
            setOperatingDays(busSchedule.operating_days ? new Date(busSchedule.operating_days).toISOString().slice(0, 10) : '');
        } else {
            // Сбрасываем состояние для режима добавления
            setId(undefined);
            setScheduleId(0);
            setBusId(0);
            setOperatingDays('');
        }
    }, [busSchedule, isActive]);

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
        const result = busScheduleSchema.safeParse({
            schedule_id,
            bus_id,
            operating_days,
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
            await NewBusSchedule({
                schedule_id,
                bus_id,
                operating_days,
            });
            
            console.log('Расписание автобуса успешно добавлено!');
            setError(null);
            handleClose();
        } catch (error) {
            console.error('Ошибка при добавлении расписания автобуса:', error);
            setError('Ошибка при добавлении расписания. Попробуйте снова.');
        }
    };

    const handleSubmitUpdate = async () => {
        if (!validateForm()) return;
        try {
            if (id === undefined) throw new Error('ID расписания автобуса не определён');
            await UpdateBusSchedule(id, {
                schedule_id,
                bus_id,
                operating_days,
            });


            console.log('Расписание автобуса успешно обновлено!');
            setError(null);
            handleClose();
        } catch (error) {
            console.error('Ошибка при обновлении расписания автобуса:', error);
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
                            value={schedule_id}
                            onChange={(e) => setScheduleId(Number(e.target.value))}
                            placeholder="ID расписания"
                            className="form-new-routes__input"
                            required
                        />
                        {validationErrors.schedule_id && <span className="form-new-routes__error">{validationErrors.schedule_id}</span>}
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
                        {validationErrors.bus_id && <span className="form-new-routes__error">{validationErrors.bus_id}</span>}
                    </div>
                    <div className="form-new-routes__field">
                        <input
                            type="date"
                            value={operating_days}
                            onChange={(e) => setOperatingDays(e.target.value)}
                            placeholder="Дни работы (например, 2025-01-01)"
                            className="form-new-routes__input"
                            required
                            min={today}
                        />
                        {validationErrors.operating_days && <span className="form-new-routes__error">{validationErrors.operating_days}</span>}
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

export default FormUpdateBusSchedule;