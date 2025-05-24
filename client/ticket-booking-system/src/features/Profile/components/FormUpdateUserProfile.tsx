import React, { useState, useEffect } from 'react';
import '../../../shared/styles/css/FormNewEntity.css'; // Обычный CSS
import { useProfile } from '../context/ProfileContext';
import AddEntityButton from '../../Dashboard/components/AddEntityButton';
import { z } from 'zod';

const profileSchema = z.object({
  first_name: z.string().min(1, 'Имя обязательно').max(50, 'Имя слишком длинное'),
  last_name: z.string().min(1, 'Фамилия обязательна').max(50, 'Фамилия слишком длинная'),
  middle_name: z.string().max(50, 'Отчество слишком длинное').optional(),
  phone_number: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\+?\d{10,15}$/.test(val),
      { message: 'Неверный формат номера телефона (например, +375291234567)' }
    ),
  email: z.string().email('Неверный формат email').min(1, 'Email обязателен'),
});

interface FormUpdateUserProfileProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
}

const FormUpdateUserProfile: React.FC<FormUpdateUserProfileProps> = ({ isOpen, onClose, userId }) => {
  const { fetchUserProfile, updateUserProfile, user, loading, error } = useProfile();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [isClosing, setIsClosing] = useState(false);

  // Загрузка данных профиля при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      fetchUserProfile(userId);
    }
  }, []);

  // Синхронизация состояния формы с данными из контекста
  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setMiddleName(user.middle_name || '');
      setPhoneNumber(user.phone_number || '');
      setEmail(user.email || '');
    }
  }, [user]);

  // Обработчик закрытия с анимацией
  const handleClose = () => {
    setIsClosing(true);
  };

  // Завершение закрытия после анимации
  useEffect(() => {
    if (isClosing) {
      const timer = setTimeout(() => {
        setIsClosing(false);
        onClose();
      }, 300); // Длительность анимации
      return () => clearTimeout(timer);
    }
  }, [isClosing, onClose]);

  // Обработчик клавиши Escape
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen && !isClosing) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, isClosing]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;
    await updateUserProfile(userId, {
      first_name: firstName,
      last_name: lastName,
      middle_name: middleName,
      phone_number: phoneNumber,
      email,
    });
    if (!error) {
      handleClose(); // Закрываем только при отсутствии ошибки
    }
  };

  if (!isOpen) return null;

  const validateForm = () => {
    const result = profileSchema.safeParse({
      first_name: firstName,
      last_name: lastName,
      middle_name: middleName,
      phone_number: phoneNumber,
      email,
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

  return (
    <div
      className={`modal-overlay ${isClosing ? 'modal-overlay--fade-out' : 'modal-overlay--fade-in'}`}
      onClick={handleClose}
    >
      <div
        className={`modal-content ${isClosing ? 'modal-content--slide-out' : 'modal-content--slide-in'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <form className="form-new-routes" onSubmit={handleSubmit}>
        {validationErrors.general && <p className="form-new-routes__error">{validationErrors.general}</p>}
          <div className="form-new-routes__field">
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Имя"
              className="form-new-routes__input"
              required
            />
            {validationErrors.first_name && <span className="form-new-routes__error">{validationErrors.first_name}</span>}
          </div>
          <div className="form-new-routes__field">
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Фамилия"
              className="form-new-routes__input"
              required
            />
            {validationErrors.last_name && <span className="form-new-routes__error">{validationErrors.last_name}</span>}
          </div>
          <div className="form-new-routes__field">
            <input
              type="text"
              value={middleName}
              onChange={(e) => setMiddleName(e.target.value)}
              placeholder="Отчество"
              className="form-new-routes__input"
            />
            {validationErrors.middle_name && <span className="form-new-routes__error">{validationErrors.middle_name}</span>}
          </div>
          <div className="form-new-routes__field">
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Номер телефона (например, +375291234567)"
              className="form-new-routes__input"
            />
            {validationErrors.phone_number && <span className="form-new-routes__error">{validationErrors.phone_number}</span>}
          </div>
          <div className="form-new-routes__field">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="form-new-routes__input"
              required
            />
            {validationErrors.email && <span className="form-new-routes__error">{validationErrors.email}</span>}
          </div>
          {loading && <p className="form-new-routes__error">Загрузка...</p>}
          {error && <p className="form-new-routes__error">{error}</p>}
          <div className="form-new-routes__actions">
            <AddEntityButton nameButton="Обновить профиль" onClick={() => handleSubmit()} />
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormUpdateUserProfile;