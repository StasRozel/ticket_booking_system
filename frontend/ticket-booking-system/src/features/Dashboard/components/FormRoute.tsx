import React, { useEffect, useState } from 'react';
import AddEntityButton from './AddEntityButton';
import '../styles/css/FormNewEntity.css';
import { useDashboard } from '../context/DashboardContext';
import { RouteType } from '../../../shared/types/RouteType';
import { z } from 'zod';

interface FormUpdateRouteProps {
    isOpen: boolean;
    onClose: () => void;
    isActive: boolean;
    route?: RouteType | null;
}

const routeSchema = z.object({
    name: z.string().regex(/^[А-Яа-яЁёA-Za-z]+ - [А-Яа-яЁёA-Za-z]+$/, 'Название маршрута должно состоять из "начальная точка - конечная точка"').min(1, 'Название маршрута обязательно'),
    starting_point: z.string().min(1, 'Начальная точка обязательна'),
    ending_point: z.string().min(1, 'Конечная точка обязательна'),
    stops: z.string().optional(),
    distance: z.coerce.number().min(1, 'Расстояние должно быть больше 0'),
    price: z.coerce.number().min(0, 'Цена не может быть отрицательной'),
});

const FormUpdateRoute: React.FC<FormUpdateRouteProps> = ({ isOpen, onClose, isActive, route }) => {
    const [id, setId] = useState<number | undefined>(undefined);
    const [name, setName] = useState('');
    const [starting_point, setStartingPoint] = useState('');
    const [ending_point, setEndingPoint] = useState('');
    const [stops, setStops] = useState('');
    const [distance, setDistance] = useState<number>(0);
    const [price, setPrice] = useState<number>(0);
    const [isClosing, setIsClosing] = useState(false);
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

    const { NewRoute, UpdateRoute } = useDashboard();

    // Синхронизация состояния формы с пропсом route
    useEffect(() => {
        if (route && !isActive) {
            setId(route.id);
            setName(route.name || '');
            setStartingPoint(route.starting_point || '');
            setEndingPoint(route.ending_point || '');
            setStops(route.stops || '');
            setDistance(route.distance || 0);
            setPrice(route.price || 0);
        } else {
            // Сбрасываем состояние для режима добавления
            setId(undefined);
            setName('');
            setStartingPoint('');
            setEndingPoint('');
            setStops('');
            setDistance(0);
            setPrice(0);
        }
    }, [route, isActive]);

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
        const result = routeSchema.safeParse({
            name,
            starting_point,
            ending_point,
            stops,
            distance,
            price,
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
            await NewRoute({
                name,
                starting_point,
                ending_point,
                stops,
                distance,
                price,
            });
            console.log('Маршрут успешно добавлен!');
            onClose();
        } catch (error) {
            console.error('Ошибка при добавлении маршрута:', error);
        }
    };

    const handleSubmitUpdate = async () => {
        if (!validateForm()) return;
        try {
            if (id === undefined) throw new Error('ID маршрута не определён');
            await UpdateRoute(id, {
                name,
                starting_point,
                ending_point,
                stops,
                distance,
                price,
            });
            console.log('Маршрут успешно обновлен!');
            onClose();
        } catch (error) {
            console.error('Ошибка при обновлении маршрута:', error);
        }
    };

    const dispatchHandles = (isActive: boolean) => {
        if (isActive) handleSubmitAdd();
        else handleSubmitUpdate();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <form className="form-new-routes" onSubmit={(e) => { e.preventDefault(); dispatchHandles(isActive); }}>
                    <button type="button" className="modal-close" onClick={onClose}>
                        ×
                    </button>
                    <div className="form-new-routes__field">
                        <input
                            type="text"
                            value={id ?? ''}
                            onChange={(e) => setId(e.target.value ? Number(e.target.value) : undefined)}
                            placeholder="ID маршрута"
                            className={`form-new-routes__input ${isActive ? 'form-new-routes__none' : ''}`}
                            required={!isActive}
                            disabled={isActive} // Отключаем поле ID в режиме добавления
                        />
                    </div>
                    <div className="form-new-routes__field">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Название маршрута"
                            className="form-new-routes__input"
                            required
                        />
                        {validationErrors.name && <span className="form-new-routes__error">{validationErrors.name}</span>}
                    </div>
                    <div className="form-new-routes__field">
                        <input
                            type="text"
                            value={starting_point}
                            onChange={(e) => setStartingPoint(e.target.value)}
                            placeholder="Начальная точка"
                            className="form-new-routes__input"
                            required
                        />
                        {validationErrors.starting_point && <span className="form-new-routes__error">{validationErrors.starting_point}</span>}
                    </div>
                    <div className="form-new-routes__field">
                        <input
                            type="text"
                            value={ending_point}
                            onChange={(e) => setEndingPoint(e.target.value)}
                            placeholder="Конечная точка"
                            className="form-new-routes__input"
                            required
                        />
                        {validationErrors.ending_point && <span className="form-new-routes__error">{validationErrors.ending_point}</span>}
                    </div>
                    <div className="form-new-routes__field">
                        <input
                            type="text"
                            value={stops}
                            onChange={(e) => setStops(e.target.value)}
                            placeholder="Остановки (через запятую)"
                            className="form-new-routes__input"
                        />
                    </div>
                    <div className="form-new-routes__field">
                        <input
                            type="number"
                            value={distance}
                            onChange={(e) => setDistance(Number(e.target.value))}
                            placeholder="Расстояние (км)"
                            className="form-new-routes__input"
                            required
                        />
                        {validationErrors.distance && <span className="form-new-routes__error">{validationErrors.distance}</span>}
                    </div>
                    <div className="form-new-routes__field">
                        <input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(Number(e.target.value))}
                            placeholder="Цена (BYN)"
                            className="form-new-routes__input"
                            required
                        />
                        {validationErrors.price && <span className="form-new-routes__error">{validationErrors.price}</span>}
                    </div>
                    <div className="form-new-routes__actions">
                        <AddEntityButton
                            nameButton={isActive ? 'Добавить маршрут' : 'Обновить маршрут'}
                            onClick={async () => dispatchHandles(isActive)}
                        />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FormUpdateRoute;