import React, { useState } from 'react';
import { useDriver } from '../context/DriverContext';

const EmergencyButton: React.FC = () => {
  const { sendUrgentCall } = useDriver() as any;
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setMessage(null);
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          try {
            const resp = await sendUrgentCall({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
            if (resp?.success) setMessage('Вызов отправлен');
            else setMessage(resp?.error || 'Ошибка при отправке вызова');
          } catch (err) {
            setMessage('Ошибка при отправке вызова');
          } finally {
            setLoading(false);
          }
        }, async () => {
          try {
            const resp = await sendUrgentCall();
            if (resp?.success) setMessage('Вызов отправлен (без геопозиции)');
            else setMessage(resp?.error || 'Ошибка при отправке вызова');
          } catch (err) {
            setMessage('Ошибка при отправке вызова');
          } finally {
            setLoading(false);
          }
        });
      } else {
        await sendUrgentCall();
        setMessage('Вызов отправлен (геопозиция недоступна)');
        setLoading(false);
      }
    } catch (err) {
      console.error('EmergencyButton error', err);
      setMessage('Ошибка при отправке вызова');
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="driver-dashboard__emergency-btn"
      >
        {loading ? 'Отправка...' : 'Экстренный вызов'}
      </button>
      {message && <div className="driver-dashboard__emergency-message">{message}</div>}
    </div>
  );
};

export default EmergencyButton;
