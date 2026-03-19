import { io, Socket } from 'socket.io-client';

class SocketService {
  private static instance: SocketService;
  private _socket: Socket;

  private constructor() {
    this._socket = io(process.env.REACT_APP_SOCKET_URL!, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    this._socket.on('connect', () => {
      console.log('Успешно подключено к серверу:', this._socket.id);
    });

    this._socket.on('connect_error', (err) => {
      console.error('Ошибка подключения:', err.message);
    });
  }

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  get socket(): Socket {
    return this._socket;
  }
}

export const socketService = SocketService.getInstance();
export const socket = socketService.socket;
