import React, { useState } from 'react';
import { useDriver } from '../context/DriverContext';

async function getIpCoords(): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const res = await fetch('https://ipapi.co/json/');
    const data = await res.json();
    if (data.latitude && data.longitude) {
      return { latitude: data.latitude, longitude: data.longitude };
    }
  } catch (_) {}
  return null;
}

function getBrowserCoords(): Promise<{ latitude: number; longitude: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      (err) => {
        console.warn('[geolocation] browser error:', err.code, err.message);
        resolve(null);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 },
    );
  });
}

const EmergencyButton: React.FC = () => {
  const { sendUrgentCall } = useDriver() as any;
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setMessage(null);
    try {
      // Сначала пробуем браузерный GPS, потом IP-геолокацию как fallback
      let coords = await getBrowserCoords();
      if (!coords) {
        console.warn('[geolocation] browser unavailable, trying IP geolocation...');
        coords = await getIpCoords();
      }

      if (coords) {
        console.log('[geolocation] coords:', coords);
      } else {
        console.warn('[geolocation] all methods failed, sending without coords');
      }

      const resp = await sendUrgentCall(coords ?? undefined);
      if (resp?.success) {
        setMessage(coords ? 'Вызов отправлен' : 'Вызов отправлен (без геопозиции)');
      } else {
        setMessage(resp?.error || 'Ошибка при отправке вызова');
      }
    } catch (err) {
      console.error('EmergencyButton error', err);
      setMessage('Ошибка при отправке вызова');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        className="driver-dashboard__emergency-btn"
      >
        {loading ? '...' : 'SOS'}
      </button>
      {message && <div className="driver-dashboard__emergency-message">{message}</div>}
    </>
  );
};

export default EmergencyButton;
