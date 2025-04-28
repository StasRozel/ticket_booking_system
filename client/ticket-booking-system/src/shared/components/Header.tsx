// src/components/Header.tsx
import React, { useState, useEffect } from 'react';
import '../styles/css/Header.css';
import { useAuth } from '../../features/Auth/context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../img/logo.png';
import axios from 'axios';
import { useModal } from '../context/ModalContext';
import ConfirmModal from './ConfirmModal';

const Header: React.FC = () => {
  const { logout } = useAuth();

  const { modalMessage, isModalOpen, openModal, handleModalClose } = useModal();
  const navigate = useNavigate();
  const [pendingBookingsCount, setPendingBookingsCount] = useState<number>(0);

  

  // Загружаем количество незавершенных бронирований
  useEffect(() => {
    const fetchPendingBookings = async () => {
      try {
        const userId = localStorage.getItem('userId'); // Предполагаем, что userId доступен (можно взять из контекста авторизации)
        const bookingResponse = await axios.get(`http://localhost:3001/booking/${userId}`);
        const data = bookingResponse.data;

        if (data) {
          const pendingCount = data.filter((booking: { status: string }) =>
            booking.status.toLowerCase() === 'выбран'
          ).length;
          setPendingBookingsCount(pendingCount);
        }
      } catch (err) {
        console.error('Ошибка при загрузке бронирований:', err);
      }
    };

    fetchPendingBookings();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header__logo">
          <img src={Logo} alt="Atlas Logo" />
        </div>
        <nav className="header__nav">
          <ul>
            <li><Link to="/home">Главная</Link></li>
            <li><Link to="/profile">Профиль</Link></li>
            <li><Link to="/contacts">Контакты</Link></li>
            <li><Link to="/about">О нас</Link></li>
          </ul>
        </nav>
        <div className="header__actions">
          <div className="header__action-wrapper">
            <button className="header__action">
              <Link to="/pending-bookings">Брони</Link>
            </button>
            {pendingBookingsCount > 0 && (
              <span className="header__notification">{pendingBookingsCount}</span>
            )}
          </div>
          <button className="sidebar__logout" onClick={() => {openModal('Вы уверены, что хотите выйти?', handleLogout)}}>
            Выйти
          </button>
        </div>
      </div>
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        message={modalMessage}
      />
    </header>
  );
};

export default Header;