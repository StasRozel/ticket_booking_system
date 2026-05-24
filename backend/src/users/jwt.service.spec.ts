import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from './jwt.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

describe('JwtService', () => {
  let service: JwtService;

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
      ],
    }).compile();
    service = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.ACCESS_TOKEN_SECRET;
    delete process.env.REFRESH_TOKEN_SECRET;
  });

  describe('getAccessSecret', () => {
    it('should throw if ACCESS_TOKEN_SECRET not set', () => {
      expect(() => service.getAccessSecret()).toThrow('ACCESS_TOKEN_SECRET not set');
    });

    it('should return secret', () => {
      process.env.ACCESS_TOKEN_SECRET = 'access-secret';
      expect(service.getAccessSecret()).toBe('access-secret');
    });
  });

  describe('getRefreshSecret', () => {
    it('should throw if REFRESH_TOKEN_SECRET not set', () => {
      expect(() => service.getRefreshSecret()).toThrow('REFRESH_TOKEN_SECRET not set');
    });

    it('should return secret', () => {
      process.env.REFRESH_TOKEN_SECRET = 'refresh-secret';
      expect(service.getRefreshSecret()).toBe('refresh-secret');
    });
  });

  describe('generateTokens', () => {
    beforeEach(() => {
      process.env.ACCESS_TOKEN_SECRET = 'access-secret';
      process.env.REFRESH_TOKEN_SECRET = 'refresh-secret';
    });

    it('should generate access and refresh tokens', () => {
      const user = { id: 1, email: 'test@test.com' } as any;
      const tokens = service.generateTokens(user);
      expect(tokens.accessToken).toBeTruthy();
      expect(tokens.refreshToken).toBeTruthy();
    });

    it('should return empty on error', () => {
      delete process.env.ACCESS_TOKEN_SECRET;
      const user = { id: 1, email: 'test@test.com' } as any;
      const tokens = service.generateTokens(user);
      expect(tokens.accessToken).toBe('');
      expect(tokens.refreshToken).toBe('');
    });
  });

  describe('generateAccessToken', () => {
    beforeEach(() => {
      process.env.ACCESS_TOKEN_SECRET = 'access-secret';
    });

    it('should generate access token', () => {
      const token = service.generateAccessToken({ id: 1, email: 'test@test.com' } as any);
      expect(token).toBeTruthy();
    });
  });

  describe('verifyAccessToken', () => {
    beforeEach(() => {
      process.env.ACCESS_TOKEN_SECRET = 'access-secret';
    });

    it('should verify token', () => {
      const token = service.generateAccessToken({ id: 1, email: 'test@test.com' } as any);
      const decoded = service.verifyAccessToken(token);
      expect(decoded).toBeTruthy();
    });
  });

  describe('refreshAccessToken', () => {
    beforeEach(() => {
      process.env.ACCESS_TOKEN_SECRET = 'access-secret';
      process.env.REFRESH_TOKEN_SECRET = 'refresh-secret';
    });

    it('should throw if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(service.refreshAccessToken('invalid')).rejects.toThrow('Invalid refresh token');
    });

    it('should throw if refresh token invalid', async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: 1, refresh_token: 'stored' } as any);
      await expect(service.refreshAccessToken('bad-token')).rejects.toThrow('Invalid refresh token');
    });

    it('should return new access token', async () => {
      const user = { id: 1, email: 'test@test.com' } as any;
      const { refreshToken } = service.generateTokens(user);
      mockUserRepository.findOne.mockResolvedValue({ ...user, refresh_token: refreshToken });

      const result = await service.refreshAccessToken(refreshToken);
      expect(result.accessToken).toBeTruthy();
    });
  });
});
