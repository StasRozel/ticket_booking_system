import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtService } from './jwt.service';
import bcrypt from 'bcryptjs';

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;

  let mockUserRepository: any;
  let mockJwtService: any;

  beforeEach(async () => {
    mockUserRepository = {
      find: jest.fn(),
      findOneBy: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn().mockImplementation((u) => {
        if (!u.id) u.id = 1;
        return Promise.resolve(u);
      }),
      update: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    mockJwtService = {
      generateTokens: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('should create and save user', async () => {
      const dto = { email: 'test@test.com' };
      mockUserRepository.create.mockReturnValue(dto);
      mockUserRepository.save.mockResolvedValue({ id: 1, ...dto });
      expect(await service.create(dto as any)).toEqual({ id: 1, ...dto });
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      mockUserRepository.find.mockResolvedValue([{ id: 1 }]);
      expect(await service.findAll()).toEqual([{ id: 1 }]);
    });
  });

  describe('findOne', () => {
    it('should return user by id', async () => {
      mockUserRepository.findOneBy.mockResolvedValue({ id: 1 });
      expect(await service.findOne(1)).toEqual({ id: 1 });
    });
  });

  describe('findTicketsUser', () => {
    it('should return bookings with relations', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({
          id: 1,
          bookings: [{ id: 1, tickets: [] }],
        }),
      };
      mockUserRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      const result = await service.findTicketsUser(1);
      expect(result).toEqual([{ id: 1, tickets: [] }]);
    });

    it('should return undefined if user not found', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };
      mockUserRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      expect(await service.findTicketsUser(1)).toBeUndefined();
    });
  });

  describe('register', () => {
    it('should throw if user exists', async () => {
      mockUserRepository.findOneBy.mockResolvedValue({ id: 1 });
      await expect(service.register({ email: 'test@test.com' } as any)).rejects.toThrow('User already exists');
    });

    it('should create user and return tokens', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue({ email: 'test@test.com', password: 'hashed' });
      mockJwtService.generateTokens.mockReturnValue({
        accessToken: 'at',
        refreshToken: 'rt',
      });

      const result = await service.register({
        email: 'test@test.com',
        password: 'pass',
      } as any);
      expect(result).toEqual({
        user_id: 1,
        accessToken: 'at',
        refreshToken: 'rt',
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('pass', 10);
    });
  });

  describe('login', () => {
    it('should throw if invalid credentials', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);
      await expect(service.login('email', 'pass')).rejects.toThrow('Invalid credentials');
    });

    it('should return tokens on success', async () => {
      const user = {
        id: 1,
        email: 'test@test.com',
        password: 'hashed',
        role_id: 1,
        is_blocked: false,
      };
      mockUserRepository.findOneBy.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.generateTokens.mockReturnValue({
        accessToken: 'at',
        refreshToken: 'rt',
      });
      mockUserRepository.save.mockResolvedValue(user);

      const result = await service.login('test@test.com', 'pass');
      expect(result).toEqual({
        user_id: 1,
        accessToken: 'at',
        refreshToken: 'rt',
        isAdmin: true,
        isBlocked: false,
      });
    });
  });

  describe('logout', () => {
    it('should clear refresh token', async () => {
      mockUserRepository.findOne.mockResolvedValue({
        id: 1,
        refresh_token: 'rt',
      });
      mockUserRepository.save.mockResolvedValue(undefined);
      await service.logout('rt');
      expect(mockUserRepository.save).toHaveBeenCalledWith({
        id: 1,
        refresh_token: '',
      });
    });
  });

  describe('update', () => {
    it('should return null if not found', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);
      expect(await service.update(1, {} as any)).toBeNull();
    });

    it('should hash password and update', async () => {
      mockUserRepository.findOneBy
        .mockResolvedValueOnce({ id: 1, password: 'old' })
        .mockResolvedValueOnce({ id: 1, password: 'hashed_password' });
      mockUserRepository.update.mockResolvedValue(undefined);
      const result = await service.update(1, { password: 'newpass' } as any);
      expect(result).toEqual({ id: 1, password: 'hashed_password' });
    });
  });

  describe('remove', () => {
    it('should return true if deleted', async () => {
      mockUserRepository.delete.mockResolvedValue({ affected: 1 });
      expect(await service.remove(1)).toBe(true);
    });
  });
});
