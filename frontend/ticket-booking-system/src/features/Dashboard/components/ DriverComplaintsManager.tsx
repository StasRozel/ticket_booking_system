import React, { useEffect, useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import '../styles/css/DriverComplaints.css';

interface Complaint {
  id: number;
  driverId: number;
  userId: number;
  complaintText: string;
  createdAt: string;
  driver?: {
    id: number;
    user_id: number;
    user?: {
      first_name: string;
      last_name: string;
      middle_name?: string;
    };
  };
  user?: {
    first_name: string;
    last_name: string;
    middle_name?: string;
    email?: string;
    phone_number?: string;
  };
}

const DriverComplaintsManager: React.FC = () => {
  const { trigger, driverComplaints, fetchDriverComplaints, deleteDriverComplaint } = useDashboard() as any;
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    fetchDriverComplaints();
  }, [trigger]);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить эту жалобу?')) {
      try {
        await deleteDriverComplaint(id);
      } catch (err) {
        console.error('Delete complaint error', err);
        alert('Ошибка при удалении жалобы');
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="driver-complaints">
      <h2>Жалобы водителей на пассажиров</h2>
      <div className="container">
        {!driverComplaints || driverComplaints.length === 0 ? (
          <p className="driver-complaints__empty">Жалоб пока нет</p>
        ) : (
          <table className="driver-complaints__table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Водитель</th>
                <th>Пассажир</th>
                <th>Дата</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {driverComplaints.map((complaint: Complaint) => (
                <React.Fragment key={complaint.id}>
                  <tr>
                    <td>{complaint.id}</td>
                    <td>
                      {complaint.driver?.user
                        ? `${complaint.driver.user.last_name} ${complaint.driver.user.first_name} ${complaint.driver.user.middle_name || ''}`.trim()
                        : `ID водителя: ${complaint.driverId}`}
                    </td>
                    <td>
                      {complaint.user
                        ? `${complaint.user.last_name} ${complaint.user.first_name} ${complaint.user.middle_name || ''}`.trim()
                        : `ID пассажира: ${complaint.userId}`}
                      {complaint.user?.phone_number && (
                        <div className="driver-complaints__contact">
                          Тел: {complaint.user.phone_number}
                        </div>
                      )}
                    </td>
                    <td>{formatDate(complaint.createdAt)}</td>
                    <td>
                      <div className="driver-complaints__actions">
                        <button
                          className="driver-complaints__btn driver-complaints__btn--view"
                          onClick={() => toggleExpand(complaint.id)}
                        >
                          {expandedId === complaint.id ? 'Скрыть' : 'Посмотреть'}
                        </button>
                        <button
                          className="driver-complaints__btn driver-complaints__btn--delete"
                          onClick={() => handleDelete(complaint.id)}
                        >
                          Удалить
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedId === complaint.id && (
                    <tr className="driver-complaints__expanded">
                      <td colSpan={5}>
                        <div className="driver-complaints__text">
                          <strong>Текст жалобы:</strong>
                          <p>{complaint.complaintText}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DriverComplaintsManager;
