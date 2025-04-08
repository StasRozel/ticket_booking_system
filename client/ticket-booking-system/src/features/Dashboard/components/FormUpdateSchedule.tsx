import { useState } from "react";
import AddEntityButton from "./AddEntityButton";
import "../styles/css/FormNewEntity.css"
import { useDashboard } from "../context/DashboardContext";

const FormUpdateSchedule: React.FC = () => {
    const [id, setId] = useState(0);
    const [route_id, setRouteId] = useState(0);
    const [departure_time, setDepartureTime] = useState('');
    const [arrival_time, setArrivalTime] = useState('');

    const { UpdateSchedule } = useDashboard();

    const handleSubmit = async () => {
        try {
            await UpdateSchedule(id, {
                route_id,
                departure_time,
                arrival_time
            });
            console.log('Маршрут успешно обновлен!');
        } catch (error) {
            console.error('Ошибка при обновлении маршрута:', error);
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
                />
            </div>
            <div className="form-new-routes__field">
                <input
                    type="text"
                    value={route_id}
                    onChange={(e) => setRouteId(Number(e.target.value))}
                    placeholder="Название маршрута"
                    className="form-new-routes__input"
                    required
                />
            </div>
            <div className="form-new-routes__field">
                <input
                    type="time"
                    value={departure_time}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    placeholder="Название маршрута"
                    className="form-new-routes__input"
                    required
                />
            </div>
            <div className="form-new-routes__field">
                <input
                    type="time"
                    value={arrival_time}
                    onChange={(e) => setArrivalTime(e.target.value)}
                    placeholder="Начальная точка"
                    className="form-new-routes__input"
                    required
                />
            </div>
            <div className="form-new-routes__actions">
                <AddEntityButton nameButton="Обновить маршрут" onClick={handleSubmit} />
            </div>
        </form>
    )
}

export default FormUpdateSchedule;