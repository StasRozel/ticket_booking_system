import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/css/UsersManagement.css';

interface User {
  id: number;
  username: string;
  email: string;
  blocked: boolean;
}

const api = axios.create({
  baseURL: 'http://localhost:3001/',
});

const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/users/');
      setUsers(response.data);
    } catch (err) {
      console.error('Ошибка при загрузке пользователей:', err);
      setError('Не удалось загрузить список пользователей. Попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };
  const toggleUserBlock = async (userId: number, blocked: boolean) => {
    try {
      await api.patch(`/users/blocked/${userId}`, { is_blocked: !blocked });
      console.log(`Пользователь ${userId} ${blocked ? 'разблокирован' : 'заблокирован'}`);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, blocked: !blocked } : user
        )
      );
    } catch (err) {
      console.error('Ошибка при обновлении статуса пользователя:', err);
      setError('Не удалось обновить статус пользователя. Попробуйте снова.');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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
                      onChange={() => toggleUserBlock(user.id, user.is_blocked)}
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
    </div>
  );
};

export default UsersManagement;