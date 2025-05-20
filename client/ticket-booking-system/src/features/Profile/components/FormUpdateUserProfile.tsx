import React, { useState, useEffect } from 'react';
import '../../../shared/styles/css/FormNewEntity.css'; // Обычный CSS
import { useProfile } from '../context/ProfileContext';
import AddEntityButton from '../../Dashboard/components/AddEntityButton';

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

  const handleSubmit = async () => {

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
          <button type="button" className="modal-close" onClick={handleClose}>
            ×
          </button>
          <div className="form-new-routes__field">
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Имя"
              className="form-new-routes__input"
              required
            />
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
          </div>
          <div className="form-new-routes__field">
            <input
              type="text"
              value={middleName}
              onChange={(e) => setMiddleName(e.target.value)}
              placeholder="Отчество"
              className="form-new-routes__input"
            />
          </div>
          <div className="form-new-routes__field">
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Номер телефона"
              className="form-new-routes__input"
              required
            />
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
          </div>
          {loading && <p className="form-new-routes__error">Загрузка...</p>}
          {error && <p className="form-new-routes__error">{error}</p>}
          <div className="form-new-routes__actions">
            <AddEntityButton nameButton="Обновить профиль" onClick={handleSubmit} />
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormUpdateUserProfile;