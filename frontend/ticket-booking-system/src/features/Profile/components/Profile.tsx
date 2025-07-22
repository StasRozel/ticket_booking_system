import React, { useEffect, useState } from 'react';
import '../styles/css/Profile.css';
import Header from '../../../shared/components/Header';
import Footer from '../../../shared/components/Footer';
import BookingList from './BookingList';
import { useProfile } from '../context/ProfileContext';
import FormUpdateUserProfile from './FormUpdateUserProfile';

const UserProfile: React.FC = () => {
  const { user, loading, error, fetchUser, handleScroll } = useProfile();
  const [isModalOpen, setIsModalOpen] = useState(false);
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <>
      <Header />

      <section className="user-profile">
        <div className="container">
          <div className="user-profile__header">
            <h2>Профиль пользователя</h2>
            {user && (
              <div className="user-profile__actions">
                <button className="user-profile__edit-button" onClick={() => setIsModalOpen(true)}>
                  Редактировать
                </button>
                <FormUpdateUserProfile
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                userId={user.id as number}
              />
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
                  {user.first_name.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="user-profile__info">
                <h3 className="user-profile__name">{user.last_name} {user.first_name} {user.middle_name}</h3>
                <p className="user-profile__detail">
                  <strong>Email:</strong> {user.email}
                </p>
                <p className="user-profile__detail">
                  <strong>Телефон:</strong> {user.phone_number == '' ? 'Не указан': user.phone_number}
                </p>
                <p className="user-profile__detail">
                  <strong>Количество поездок:</strong> {user.count_trips}
                </p>
              </div>
            </div>
          )}
        </div>
        <BookingList/>
      </section>
      <Footer />
    </>
  );
};

export default UserProfile;