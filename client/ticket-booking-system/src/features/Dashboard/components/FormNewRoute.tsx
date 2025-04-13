import { useState } from "react";
import AddEntityButton from "./AddEntityButton";
import "../styles/css/FormNewEntity.css"
import { useDashboard } from "../context/DashboardContext";

const FormNewRoute: React.FC = () => {
    const [name, setName] = useState('');
    const [starting_point, setStartingPoint] = useState('');
    const [ending_point, setEndingPoint] = useState('');
    const [stops, setStops] = useState('');
    const [distance, setDistance] = useState(0);
    const [price, setPrice] = useState(0);
    
    const {NewRoute} = useDashboard();

 const handleSubmit = async () => {
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
        } catch (error) {
            console.error('Ошибка при добавлении маршрута:', error);
        }
    };

    return (
        <form className="form-new-routes" onSubmit={handleSubmit}>
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
        <AddEntityButton nameButton="Добавить маршрут" onClick={handleSubmit} />
      </div>
    </form>
    )
}

export default FormNewRoute;