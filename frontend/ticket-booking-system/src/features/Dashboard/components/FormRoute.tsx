import React, { useEffect, useState } from 'react';
import AddEntityButton from './AddEntityButton';
import '../styles/css/FormNewEntity.css';
import { useDashboard } from '../context/DashboardContext';
import { RouteType } from '../../../shared/types/RouteType';
import { z } from 'zod';
import { validate } from '../../../shared/utils/validateForm';

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
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

    const { createEntity, updateEntity } = useDashboard();

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
            setId(undefined);
            setName('');
            setStartingPoint('');
            setEndingPoint('');
            setStops('');
            setDistance(0);
            setPrice(0);
        }
    }, [route, isActive]);


    const validateForm = () => {
        const result = validate(routeSchema, {
            name,
            starting_point,
            ending_point,
            stops,
            distance,
            price,
        });

        setValidationErrors(result.errors);
        return result.success;

    };

    const handleSubmitAdd = async () => {
        if (!validateForm()) return;
        try {
            await createEntity('/routes', {
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
            await updateEntity('/routes', id, {
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
                    {!isActive && (
                        <div className="form-new-routes__field">
                            <label className="form-new-routes__label">ID маршрута</label>
                            <input
                                type="text"
                                value={id ?? ''}
                                onChange={(e) => setId(e.target.value ? Number(e.target.value) : undefined)}
                                className="form-new-routes__input"
                                disabled
                            />
                        </div>
                    )}
                    <div className="form-new-routes__field">
                        <label className="form-new-routes__label">Название маршрута</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="form-new-routes__input"
                            required
                        />
                        {validationErrors.name && <span className="form-new-routes__error">{validationErrors.name}</span>}
                    </div>
                    <div className="form-new-routes__field">
                        <label className="form-new-routes__label">Начальная точка</label>
                        <input
                            type="text"
                            value={starting_point}
                            onChange={(e) => setStartingPoint(e.target.value)}
                            className="form-new-routes__input"
                            required
                        />
                        {validationErrors.starting_point && <span className="form-new-routes__error">{validationErrors.starting_point}</span>}
                    </div>
                    <div className="form-new-routes__field">
                        <label className="form-new-routes__label">Конечная точка</label>
                        <input
                            type="text"
                            value={ending_point}
                            onChange={(e) => setEndingPoint(e.target.value)}
                            className="form-new-routes__input"
                            required
                        />
                        {validationErrors.ending_point && <span className="form-new-routes__error">{validationErrors.ending_point}</span>}
                    </div>
                    <div className="form-new-routes__field">
                        <label className="form-new-routes__label">Остановки (через запятую)</label>
                        <input
                            type="text"
                            value={stops}
                            onChange={(e) => setStops(e.target.value)}
                            className="form-new-routes__input"
                        />
                    </div>
                    <div className="form-new-routes__field">
                        <label className="form-new-routes__label">Расстояние (км)</label>
                        <input
                            type="number"
                            value={distance}
                            onChange={(e) => setDistance(Number(e.target.value))}
                            className="form-new-routes__input"
                            required
                        />
                        {validationErrors.distance && <span className="form-new-routes__error">{validationErrors.distance}</span>}
                    </div>
                    <div className="form-new-routes__field">
                        <label className="form-new-routes__label">Цена (BYN)</label>
                        <input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(Number(e.target.value))}
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