import React, { useEffect, useState } from 'react';
import '../styles/FormStaff.scss';
import api from '../../../shared/utils/api';
import { useDashboard } from '../context/DashboardContext';

interface FormStaffProps {
  isOpen: boolean;
  onClose: () => void;
  isActive: boolean;
  staff: any | null;
  initialBusId?: number | '';
  driverId?: number | null;
  onSuccess: () => void;
}

const FormStaff: React.FC<FormStaffProps> = ({ isOpen, onClose, isActive, staff, initialBusId, driverId, onSuccess }) => {
  const [first_name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');
  const [middle_name, setMiddleName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role_id, setRoleId] = useState<number>(3);
  const [busId, setBusId] = useState<number | ''>('');
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  const { buses, fetchBuses } = useDashboard();

  useEffect(() => {
    fetchBuses();
  }, [fetchBuses]);

  useEffect(() => {
    if (isOpen && !isActive && staff) {
      // Режим редактирования
      setFirstName(staff.first_name || '');
      setLastName(staff.last_name || '');
      setMiddleName(staff.middle_name || '');
      setEmail(staff.email || '');
      setRoleId(staff.role_id || 3);
      setBusId(initialBusId ?? '');
      setPassword(''); // Пароль не заполняем при редактировании
    } else if (isOpen && isActive) {
      // Режим добавления - очищаем форму
      setFirstName('');
      setLastName('');
      setMiddleName('');
      setEmail('');
      setPassword('');
      setRoleId(3);
      setBusId('');
    }
    setErrors({});
  }, [isOpen, isActive, staff]);

  const payload: any = { first_name, last_name, middle_name, role_id, email, password };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!first_name || !last_name || !email || (isActive && !password)) {
      setErrors({ general: 'Заполните обязательные поля' });
      return;
    }


    try {
      if (isActive) {
        const res = await api.post('/users/auth/register/', payload); //TODO если так создать то получу новый refresh токен
        const user_id = res.data.user_id;

        if (role_id === 3 && busId) {
          await api.post('/drivers', { user_id, bus_id: Number(busId) });
        }
      } else {

        if (role_id === 3 && busId) {
          if (driverId) {
            await api.patch(`/drivers/${driverId}`, { bus_id: Number(busId) });
          } else {
            await api.post('/drivers', { user_id: staff.id, bus_id: Number(busId) });
          }
        }

        await api.patch(`/users/${staff.id}`, payload);

      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Staff form error', err?.response?.data || err.message || err);
      setErrors({ general: 'Ошибка при сохранении данных сотрудника' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>{isActive ? 'Добавить сотрудника' : 'Редактировать сотрудника'}</h2>
        {errors.general && <div className="error">{errors.general}</div>}
        <form onSubmit={handleSubmit} className="form">
          <div className="form__field">
            <label>Имя *</label>
            <input value={first_name} onChange={e => setFirstName(e.target.value)} required />
          </div>
          <div className="form__field">
            <label>Фамилия *</label>
            <input value={last_name} onChange={e => setLastName(e.target.value)} required />
          </div>
          <div className="form__field">
            <label>Отчество</label>
            <input value={middle_name} onChange={e => setMiddleName(e.target.value)} />
          </div>
          <div className="form__field">
            <label>Email *</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form__field">
            <label>Пароль {isActive && '*'}</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required={isActive}
              placeholder={!isActive ? 'Оставьте пустым, чтобы не менять' : ''}
            />
          </div>
          <div className="form__field">
            <label>Роль *</label>
            <select value={role_id} onChange={e => setRoleId(Number(e.target.value))}>
              <option value={4}>Менеджер</option>
              <option value={3}>Водитель</option>
            </select>
          </div>
          {role_id === 3 && (
            <div className="form__field">
              <label>Автобус</label>
              <select value={busId} onChange={e => setBusId(e.target.value ? Number(e.target.value) : '')}>
                <option value="" disabled>Выберите автобус</option>
                {buses.filter((b: any) => b.available).map((b: any) => (
                  <option key={b.id} value={b.id}>
                    {b.bus_number} — {b.type}
                  </option>
                ))}
              </select>
            </div>
          )}
          <button type="submit" className="form__button">{isActive ? 'Создать' : 'Сохранить'}</button>
        </form>
      </div>
    </div>
  );
};

export default FormStaff;
