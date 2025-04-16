import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/css/Profile.css';
import Header from '../../Home/components/Header';
import Footer from '../../Home/components/Footer';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  tripsCount: number;
}

const api = axios.create({
  baseURL: 'http://localhost:3001',
});

const UserProfile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // Получение user_id из localStorage
  const userId = localStorage.getItem('userId');

  // Обработка скролла для хедера
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Загрузка данных пользователя
  const fetchUser = async () => {
    if (!userId) {
      setError('Пользователь не авторизован. Пожалуйста, войдите в аккаунт.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await api.get<User>(`/users/${userId}`);
      setUser(response.data);
    } catch (err) {
      console.error('Ошибка при загрузке данных пользователя:', err);
      setError('Не удалось загрузить данные пользователя. Попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleEdit = () => {
    console.log('Редактировать профиль');
    // Логика редактирования профиля
  };

  return (
    <>
        <Header />

      {/* Основной контент профиля */}
      <section className="user-profile">
        <div className="container">
          <div className="user-profile__header">
            <h2>Профиль пользователя</h2>
            {user && (
              <div className="user-profile__actions">
                <button className="user-profile__edit-button" onClick={handleEdit}>
                  Редактировать
                </button>
              </div>
            )}
          </div>
          {loading && (
            <p className="user-profile__loading">Загрузка...</p>
          )}
          {error && (
            <div className="user-profile__error-container">
              <p className="user-profile__error">{error}</p>
              <button
                onClick={fetchUser}
                className="user-profile__retry-button"
              >
                Повторить
              </button>
            </div>
          )}
          {user && !loading && !error && (
            <div className="user-profile__card">
              <div className="user-profile__avatar">
                <div className="user-profile__avatar-placeholder">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="user-profile__info">
                <h3 className="user-profile__name">{user.name}</h3>
                <p className="user-profile__detail">
                  <strong>Email:</strong> {user.email}
                </p>
                <p className="user-profile__detail">
                  <strong>Телефон:</strong> {user.phone}
                </p>
                <p className="user-profile__detail">
                  <strong>Количество поездок:</strong> {user.tripsCount}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
};

export default UserProfile;