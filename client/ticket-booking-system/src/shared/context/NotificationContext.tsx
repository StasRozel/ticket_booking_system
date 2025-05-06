// src/context/NotificationContext.tsx
import React, { createContext, useState, useContext } from 'react';
import { NotificationContextType } from '../types/NotificationContextType';

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const setOptionNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setIsVisible(true);
  };

  const handleAnimationEnd = () => {
    if (!isVisible) {
      setIsVisible(false); // Сбрасываем уведомление после завершения анимации
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notification,
        setOptionNotification,
        isVisible,
        setIsVisible, // Добавляем для управления видимостью
        handleAnimationEnd,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};