import React, { useEffect, useState } from 'react';
import AddEntityButton from './AddEntityButton';
import '../styles/css/FormNewEntity.css'; // Переключаем на SCSS
import { useDashboard } from '../context/DashboardContext';
import { RouteType } from '../../../shared/types/RouteType';

interface FormUpdateRouteProps {
    isOpen: boolean;
    onClose: () => void;
    isActive: boolean;
    route?: RouteType;
}

const FormUpdateRoute: React.FC<FormUpdateRouteProps> = ({ isOpen, onClose, isActive, route }) => {
    const [id, setId] = useState(route?.id);
    const [name, setName] = useState(route?.name as string);
    const [starting_point, setStartingPoint] = useState(route?.starting_point as string);
    const [ending_point, setEndingPoint] = useState(route?.ending_point as string);
    const [stops, setStops] = useState(route?.stops as string);
    const [distance, setDistance] = useState(route?.distance as number);
    const [price, setPrice] = useState(route?.price as number);
    const [isClosing, setIsClosing] = useState(false); // Состояние для анимации закрытия

    const { NewRoute, UpdateRoute } = useDashboard();

    // Обработчик для начала закрытия с анимацией
    const handleClose = () => {
        setIsClosing(true); // Запускаем анимацию закрытия
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
            await NewRoute({
                name,
                starting_point,
                ending_point,
                stops,
                distance,
                price,
            });
            console.log('Маршрут успешно добавлен!');
            onClose(); // Закрываем модальное окно после успеха
        } catch (error) {
            console.error('Ошибка при добавлении маршрута:', error);
        }
    };

    const handleSubmitUpdate = async () => {
        try {
            await UpdateRoute(id as number, {
                name,
                starting_point,
                ending_point,
                stops,
                distance,
                price,
            });
            console.log('Маршрут успешно обновлен!');
            onClose(); // Закрываем модальное окно после успеха
        } catch (error) {
            console.error('Ошибка при обновлении маршрута:', error);
        }
    };

    const dispatchHandles = (isActive: boolean) => {
        console.log(isActive);
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
                            value={id}
                            onChange={(e) => setId(Number(e.target.value))}
                            placeholder="ID маршрута"
                            className={`form-new-routes__input ${isActive ? 'form-new-routes__none' : ''}`}
                            required={!isActive} // Только для обновления
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