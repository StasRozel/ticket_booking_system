import { useState } from 'react';
import AddEntityButton from './AddEntityButton';
import '../styles/css/FormNewEntity.css'; // Оставляем исходный файл стилей
import { useDashboard } from '../context/DashboardContext';

const FormNewBusSchedule: React.FC = () => {
  const [schedule_id, setBusNumber] = useState<number>(0); 
  const [bus_id, setCapacity] = useState<number>(0); 
  const [operating_days, setType] = useState<string>(''); 

  const { NewBusSchedule } = useDashboard(); // Предполагаем, что в контексте есть метод NewBus

  const handleSubmit = async () => {

    try {
      await NewBusSchedule({
        schedule_id,
        bus_id,
        operating_days,
      });
      console.log('Автобус успешно добавлен!');

    } catch (error) {
      console.error('Ошибка при добавлении автобуса:', error);
    }
  };

  return (
    <form className="form-new-routes" onSubmit={handleSubmit}>
        <div className="form-new-routes__field">
            <input
                type="number"
                value={schedule_id}
                onChange={(e) => setBusNumber(Number(e.target.value))}
                placeholder="Номер автобуса"
                className="form-new-routes__input"
                required
            />
        </div>
        <div className="form-new-routes__field">
            <input
                type="number"
                value={bus_id} // Чтобы избежать "0" в инпуте
                onChange={(e) => setCapacity(Number(e.target.value))}
                placeholder="Вместимость (мест)"
                className="form-new-routes__input"
                required
            />
        </div>
        <div className="form-new-routes__field">
            <input
                type="text"
                value={operating_days}
                onChange={(e) => setType(e.target.value)}
                placeholder="Тип автобуса"
                className="form-new-routes__input"
                required
            />
        </div>
        <div className="form-new-routes__actions">
            <AddEntityButton nameButton="Обновить расписание транспорта" onClick={handleSubmit} />
        </div>
    </form>
);};

export default FormNewBusSchedule;