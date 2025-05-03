// src/components/ErrorPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/css/ErrorPage.css';

interface ErrorPageProps {
  statusCode: number;
  message?: string;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ statusCode, message }) => {
  const navigate = useNavigate();

  // Определяем сообщение по умолчанию в зависимости от кода ошибки
  const getDefaultMessage = (code: number): string => {
    switch (code) {
      case 401:
        return 'Не авторизован. Пожалуйста, войдите в систему.';
      case 403:
        return 'Доступ запрещён. У вас нет прав для просмотра этой страницы.';
      case 404:
        return 'Страница не найдена. Проверьте URL или вернитесь на главную.';
      default:
        return 'Произошла ошибка. Попробуйте снова позже.';
    }
  };

  const displayMessage = message || getDefaultMessage(statusCode);

  return (
    <div className="error-page">
      <div className="error-page__container">
        <h1 className="error-page__code">{statusCode}</h1>
        <p className="error-page__message">{displayMessage}</p>
        <button className="error-page__button" onClick={() => navigate('/')}>
          Вернуться на главную
        </button>
      </div>
    </div>
  );
};

export default ErrorPage;