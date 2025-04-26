import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/css/Sidebar.css';
import { useAuth } from '../../Auth/context/AuthContext';
import Logo from '../../../shared/img/logo.png'

const Sidebar: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar__logo">
        <img src={Logo} alt="Atlas Logo" />
      </div>
      <nav className="sidebar__menu">
        <ul>
          <li>
            <Link to="/dashboard/routes">Маршруты</Link>
          </li>
          <li>
            <Link to="/dashboard/schedules">Расписание</Link>
          </li>
          <li>
            <Link to="/dashboard/bus-schedules">Расписание транспорта</Link>
          </li>
          <li>
            <Link to="/dashboard/buses">Транспорт</Link>
          </li>
          <li>
            <Link to="/dashboard/users">Пользователи</Link>
          </li>
        </ul>
      </nav>
      <button className="sidebar__logout" onClick={handleLogout}>
        Выйти из аккаунта
      </button>
    </aside>
  );
};

export default Sidebar;