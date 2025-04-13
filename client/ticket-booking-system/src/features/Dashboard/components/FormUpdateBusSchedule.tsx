import { useState } from 'react';
import AddEntityButton from './AddEntityButton';
import '../styles/css/FormNewEntity.css'; // Оставляем исходный файл стилей
import { useDashboard } from '../context/DashboardContext';


const FormUpdateBusSchedule: React.FC = () => {
    const [id, setId] = useState(0);
    const [schedule_id, setScheduleId] = useState<number>(0); 
    const [bus_id, setBusId] = useState<number>(0); 
    const [operating_days, setOperatingDays] = useState<string>(''); 

    const { UpdateBusSchedule } = useDashboard(); 

    const handleSubmit = async () => {
        try {
            await UpdateBusSchedule(id, {
                schedule_id,
                bus_id,
                operating_days,
            });
            console.log('Автобус успешно обновлён!');
        } catch (error) {
            console.error('Ошибка при обновлении автобуса:', error);
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
                    type="number"
                    value={schedule_id}
                    onChange={(e) => setScheduleId(Number(e.target.value))}
                    placeholder="Номер автобуса"
                    className="form-new-routes__input"
                    required
                />
            </div>
            <div className="form-new-routes__field">
                <input
                    type="number"
                    value={bus_id} // Чтобы избежать "0" в инпуте
                    onChange={(e) => setBusId(Number(e.target.value))}
                    placeholder="Вместимость (мест)"
                    className="form-new-routes__input"
                    required
                />
            </div>
            <div className="form-new-routes__field">
                <input
                    type="text"
                    value={operating_days}
                    onChange={(e) => setOperatingDays(e.target.value)}
                    placeholder="Тип автобуса"
                    className="form-new-routes__input"
                    required
                />
            </div>
            <div className="form-new-routes__actions">
                <AddEntityButton nameButton="Обновить расписание транспорта" onClick={handleSubmit} />
            </div>
        </form>
    );
};

export default FormUpdateBusSchedule;