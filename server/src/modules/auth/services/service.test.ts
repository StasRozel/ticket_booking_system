import * as service from './service';
import * as userRepo from '../repository/repository';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

jest.mock('../repository/repository');
jest.mock('jsonwebtoken');
jest.mock('bcryptjs');

describe('Auth service', () => {
  afterEach(() => jest.clearAllMocks());

  describe('register', () => {
    it('успешная регистрация', async () => {
      (userRepo.userRepository.findOneByEmail as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      (userRepo.userRepository.create as jest.Mock).mockResolvedValue({ id: 1, email: 'test@mail.com' });
      (userRepo.userRepository.save as jest.Mock).mockResolvedValue(undefined);
      (jwt.sign as jest.Mock).mockReturnValue('token');
      process.env.REFRESH_TOKEN_SECRET = 'secret';
      process.env.ACCESS_TOKEN_SECRET = 'secret';
      const result = await service.register({ email: 'test@mail.com', password: '123' });
      expect(result).toHaveProperty('user_id', 1);
      expect(result).toHaveProperty('accessToken', 'token');
      expect(result).toHaveProperty('refreshToken', 'token');
    });
    it('ошибка если пользователь уже есть', async () => {
      (userRepo.userRepository.findOneByEmail as jest.Mock).mockResolvedValue({ id: 1 });
      await expect(service.register({ email: 'test@mail.com', password: '123' }))
        .rejects.toThrow('User already exists');
    });
  });

  describe('login', () => {
    it('успешный вход', async () => {
      (userRepo.userRepository.findOneByEmail as jest.Mock).mockResolvedValue({ id: 1, email: 'test@mail.com', password: 'hashed', role_id: 2, is_blocked: false });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (userRepo.userRepository.save as jest.Mock).mockResolvedValue(undefined);
      (jwt.sign as jest.Mock).mockReturnValue('token');
      process.env.REFRESH_TOKEN_SECRET = 'secret';
      process.env.ACCESS_TOKEN_SECRET = 'secret';
      const result = await service.login('test@mail.com', '123');
      expect(result).toHaveProperty('user_id', 1);
      expect(result).toHaveProperty('accessToken', 'token');
      expect(result).toHaveProperty('refreshToken', 'token');
      expect(result).toHaveProperty('isAdmin', false);
      expect(result).toHaveProperty('isBlocked', false);
    });
    it('ошибка если пользователя нет', async () => {
      (userRepo.userRepository.findOneByEmail as jest.Mock).mockResolvedValue(null);
      await expect(service.login('test@mail.com', '123')).rejects.toThrow('Invalid credentials');
    });
    it('ошибка если пароль не совпадает', async () => {
      (userRepo.userRepository.findOneByEmail as jest.Mock).mockResolvedValue({ id: 1, email: 'test@mail.com', password: 'hashed', role_id: 2 });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(service.login('test@mail.com', 'wrong')).rejects.toThrow('Invalid credentials');
    });
    it('isAdmin true если role_id == 1', async () => {
      (userRepo.userRepository.findOneByEmail as jest.Mock).mockResolvedValue({ id: 1, email: 'test@mail.com', password: 'hashed', role_id: 1, is_blocked: false });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (userRepo.userRepository.save as jest.Mock).mockResolvedValue(undefined);
      (jwt.sign as jest.Mock).mockReturnValue('token');
      process.env.REFRESH_TOKEN_SECRET = 'secret';
      process.env.ACCESS_TOKEN_SECRET = 'secret';
      const result = await service.login('test@mail.com', '123');
      expect(result.isAdmin).toBe(true);
    });
  });

  describe('refreshAccessToken', () => {
    it('успешное обновление', async () => {
      (userRepo.userRepository.findOne as jest.Mock).mockResolvedValue({ id: 1, email: 'test@mail.com' });
      (jwt.verify as jest.Mock).mockReturnValue({});
      (jwt.sign as jest.Mock).mockReturnValue('access');
      process.env.REFRESH_TOKEN_SECRET = 'secret';
      process.env.ACCESS_TOKEN_SECRET = 'secret';
      const result = await service.refreshAccessToken('refresh');
      expect(result).toEqual({ accessToken: 'access' });
    });
    it('ошибка если refreshToken невалидный', async () => {
      (userRepo.userRepository.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.refreshAccessToken('bad')).rejects.toThrow('Invalid refresh token');
    });
    it('ошибка если jwt.verify бросает', async () => {
      (userRepo.userRepository.findOne as jest.Mock).mockResolvedValue({ id: 1, email: 'test@mail.com' });
      (jwt.verify as jest.Mock).mockImplementation(() => { throw new Error('bad'); });
      await expect(service.refreshAccessToken('bad')).rejects.toThrow('Invalid refresh token');
    });
  });

  describe('logout', () => {
    it('успешный выход', async () => {
      (userRepo.userRepository.findOne as jest.Mock).mockResolvedValue({ id: 1, email: 'test@mail.com' });
      (userRepo.userRepository.save as jest.Mock).mockResolvedValue(undefined);
      await expect(service.logout('refresh')).resolves.toBeUndefined();
    });
    it('ничего не делает если пользователя нет', async () => {
      (userRepo.userRepository.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.logout('refresh')).resolves.toBeUndefined();
    });
  });

  describe('verifyAccessToken', () => {
    it('вернет результат jwt.verify', () => {
      (jwt.verify as jest.Mock).mockReturnValue({ id: 1 });
      process.env.ACCESS_TOKEN_SECRET = 'secret';
      const result = service.verifyAccessToken('token');
      expect(result).toEqual({ id: 1 });
    });
  });
}); 