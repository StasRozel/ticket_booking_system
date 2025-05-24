import express from 'express';
import { useExpressServer } from 'routing-controllers';
import request from 'supertest';
import { AuthController } from './authController';
import * as authService from '../services/service';

jest.mock('../services/service');

describe('AuthController', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    useExpressServer(app, {
      controllers: [AuthController],
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('POST /auth/register/ - успешная регистрация', async () => {
    (authService.register as jest.Mock).mockResolvedValue({
      user_id: 1, accessToken: 'access', refreshToken: 'refresh'
    });
    const res = await request(app).post('/auth/register/').send({ email: 'test@mail.com', password: '123' });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ user_id: 1, accessToken: 'access', refreshToken: 'refresh' });
    expect(authService.register).toHaveBeenCalled();
  });

  it('POST /auth/register/ - ошибка регистрации', async () => {
    (authService.register as jest.Mock).mockRejectedValue(new Error('User exists'));
    const res = await request(app).post('/auth/register/').send({ email: 'test@mail.com', password: '123' });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'User exists' });
  });

  it('POST /auth/login/ - успешный вход', async () => {
    (authService.login as jest.Mock).mockResolvedValue({
      user_id: 1, accessToken: 'access', refreshToken: 'refresh', isAdmin: false, isBlocked: false
    });
    const res = await request(app).post('/auth/login/').send({ email: 'test@mail.com', password: '123' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      user_id: 1, accessToken: 'access', refreshToken: 'refresh', isAdmin: false, isBlocked: false
    });
    expect(authService.login).toHaveBeenCalled();
  });

  it('POST /auth/login/ - ошибка входа', async () => {
    (authService.login as jest.Mock).mockRejectedValue(new Error('Invalid credentials'));
    const res = await request(app).post('/auth/login/').send({ email: 'test@mail.com', password: 'wrong' });
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: 'Invalid credentials' });
  });

  it('POST /auth/refresh/ - успешное обновление токена', async () => {
    (authService.refreshAccessToken as jest.Mock).mockResolvedValue({ accessToken: 'newAccess' });
    const res = await request(app).post('/auth/refresh/').send({ refreshToken: 'refresh' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ accessToken: 'newAccess' });
    expect(authService.refreshAccessToken).toHaveBeenCalled();
  });

  it('POST /auth/logout/ - успешный выход', async () => {
    (authService.logout as jest.Mock).mockResolvedValue(undefined);
    const res = await request(app).post('/auth/logout/').send({ refreshToken: 'refresh' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Logged out successfully' });
    expect(authService.logout).toHaveBeenCalled();
  });
}); 