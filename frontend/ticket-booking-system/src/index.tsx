import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { io, Socket } from 'socket.io-client';

export const socket: Socket = io(process.env.REACT_APP_SOCKET_URL);

socket.on('connect', () => {
  console.log('Успешно подключено к серверу:', socket.id);
});

socket.on('connect_error', (err) => {
  console.error('Ошибка подключения:', err.message);
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

