import React from 'react';
import ReactDOM from 'react-dom/client';
import './shared/styles/css/global.css';
import App from './App';

export { socket } from './shared/utils/SocketService';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

