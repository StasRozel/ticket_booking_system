import React, { useEffect } from 'react';
import axios from 'axios';
import '../styles/css/UsersManagement.css';
import { useDashboard } from '../context/DashboardContext';
import ConfirmModal from '../../../shared/components/ConfirmModal';
import { useModal } from '../../../shared/context/ModalContext';
import { UserType } from '../../../shared/types/UserType';

const UsersManagement: React.FC = () => {
  const { users, loading, error, trigger, fetchUsers, toggleUserBlock } = useDashboard();
  const { modalMessage, isModalOpen, openModal, handleModalClose } = useModal();

    useEffect(() => {   
      fetchUsers();
    }, [trigger]);

  return (
    <div className="user-management">
      <h2>Управление пользователями</h2>
      <div className="container">
        {loading && <p className="user-management__loading">Загрузка...</p>}
        {error && <p className="user-management__error">{error}</p>}
        <table className="user-management__table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Имя пользователя</th>
              <th>Email</th>
              <th>Телефон</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user: UserType) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.last_name} {user.first_name} {user.middle_name}</td>
                <td>{user.email}</td>
                <td>{user.phone_number == '' ? 'Не указан' : user.phone_number}</td>
                <td>{user.is_blocked ? 'Заблокирован' : 'Активен'}</td>
                <td>
                  <label className="user-management__checkbox-label">
                    <input
                      type="checkbox"
                      checked={user.is_blocked}
                      onChange={() => openModal(`Вы точно хотите ${user.is_blocked ? 'разблокировать' : 'заблокировать' } пользователя ${user.email}?`, () => toggleUserBlock(user.id as number, user.is_blocked))}
                      className="user-management__checkbox"
                    />
                    {user.is_blocked ? 'Разблокировать' : 'Заблокировать'}
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        message={modalMessage}
      />
    </div>
  );
};

export default UsersManagement;
