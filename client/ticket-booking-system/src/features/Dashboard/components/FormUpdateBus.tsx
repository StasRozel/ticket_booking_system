import { useState, useEffect } from 'react';
import AddEntityButton from './AddEntityButton';
import '../styles/css/FormNewEntity.css'; // Оставляем исходный файл стилей
import { useDashboard } from '../context/DashboardContext';

const FormUpdateBus: React.FC = () => {
    const [id, setId] = useState(0);
    const [busNumber, setBusNumber] = useState<string>(''); // Номер автобуса
    const [capacity, setCapacity] = useState<number>(0); // Вместимость
    const [type, setType] = useState<string>(''); // Тип автобуса
    const [isAvailable, setIsAvailable] = useState<boolean>(false); // Доступность
    const [error, setError] = useState<string | null>(null);

    const { UpdateBus } = useDashboard(); // Предполагаем, что в контексте есть метод UpdateBus

    const handleSubmit = async () => {

        try {
            await UpdateBus(id, {
                bus_number: busNumber,
                capacity,
                type,
                available: isAvailable,
            });
            console.log('Автобус успешно обновлён!');
        } catch (error) {
            console.error('Ошибка при обновлении автобуса:', error);
            setError('Ошибка при обновлении автобуса. Попробуйте снова.');
        }
    };

    return (
        <form className="form-new-routes" onSubmit={handleSubmit}>
            <div className="form-new-routes__field">
                <input
                    type="text"
                    value={id}
                    onChange={(e) => setId(Number(e.target.value))}
                    placeholder="Название маршрута"
                    className="form-new-routes__input"
                    required
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
                    type="number"
                    value={capacity || ''} // Чтобы избежать "0" в инпуте
                    onChange={(e) => setCapacity(Number(e.target.value))}
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
                <AddEntityButton nameButton="Обновить маршрут" onClick={handleSubmit} />
            </div>
        </form>
    );
};

export default FormUpdateBus;