// src/components/Notification.tsx
import React, { useEffect } from 'react';
import '../styles/css/Notification.css'; // Переключаем на SCSS
import { useNotification } from '../context/NotificationContext';

interface NotificationProps {
  message: string | undefined;
  type: 'success' | 'error' | undefined;
  duration?: number;
  isClose?: boolean;
}

const Notification: React.FC<NotificationProps> = ({
  message,
  type,
  duration = 3000,
  isClose,
}) => {
  const { notification, isVisible, setIsVisible, handleAnimationEnd } = useNotification();

  useEffect(() => {
    if (message && type) {
        const timer = setTimeout(() => {
            setIsVisible(false);
          }, duration);
      
          return () => clearTimeout(timer);
    }
  }, [notification]);

  if (!message || !type || !isVisible) return null;

  return (
    <div
      className={`notification notification--${type} ${isVisible ? 'notification--visible' : 'notification--hidden'}`}
      onAnimationEnd={() => handleAnimationEnd()}
    >
      <span className="notification__message">{message}</span>
      {isClose && (
        <button
          className="notification__close"
          onClick={() => setIsVisible(false)}
          aria-label="Закрыть уведомление"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default Notification;