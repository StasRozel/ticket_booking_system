import React, { useEffect } from 'react';
import axios from 'axios';
import '../styles/css/UsersManagement.css';
import { useDashboard } from '../context/DashboardContext';
import ConfirmModal from '../../../shared/components/ConfirmModal';
import { useModal } from '../../../shared/context/ModalContext';

const api = axios.create({
  baseURL: 'http://localhost:3001/',
});

const UsersManagement: React.FC = () => {
  const { users, loading, error, trigger, fetchUsers, toggleUserBlock } = useDashboard();
  const { modalMessage, isModalOpen, openModal, handleModalClose } = useModal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user: any) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.is_blocked ? 'Заблокирован' : 'Активен'}</td>
                <td>
                  <label className="user-management__checkbox-label">
                    <input
                      type="checkbox"
                      checked={user.blocked}
                      onChange={() => openModal(`Вы точно хотите заблокировать пользователя ${user.name}?`, () => toggleUserBlock(user.id, user.is_blocked))}
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
