import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtService } from './jwt.service';
import { HttpException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    register: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    findTicketsUser: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };
  const mockJwtServiceObj = {
    refreshAccessToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtServiceObj },
      ],
    }).compile();
    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('should create user', async () => {
      mockUsersService.create.mockResolvedValue({ id: 1 });
      expect(await controller.create({} as any)).toEqual({ id: 1 });
    });
  });

  describe('register', () => {
    it('should register and return tokens', async () => {
      mockUsersService.register.mockResolvedValue({
        user_id: 1,
        accessToken: 'at',
        refreshToken: 'rt',
      });
      const result = await controller.register({} as any);
      expect(result).toEqual({ user_id: 1, accessToken: 'at', refreshToken: 'rt' });
    });

    it('should throw HttpException on error', async () => {
      mockUsersService.register.mockRejectedValue(new Error('User exists'));
      await expect(controller.register({} as any)).rejects.toThrow(HttpException);
    });
  });

  describe('login', () => {
    it('should login and return tokens', async () => {
      mockUsersService.login.mockResolvedValue({
        user_id: 1,
        accessToken: 'at',
        refreshToken: 'rt',
        isAdmin: true,
        isBlocked: false,
      });
      const result = await controller.login({ email: 'a@b.com', password: 'p' });
      expect(result).toEqual({
        user_id: 1,
        accessToken: 'at',
        refreshToken: 'rt',
        isAdmin: true,
        isBlocked: false,
      });
    });

    it('should throw HttpException on error', async () => {
      mockUsersService.login.mockRejectedValue(new Error('Invalid'));
      await expect(controller.login({ email: 'a', password: 'b' })).rejects.toThrow(HttpException);
    });
  });

  describe('refresh', () => {
    it('should refresh token', async () => {
      mockJwtServiceObj.refreshAccessToken.mockResolvedValue({ accessToken: 'new-at' });
      const result = await controller.refresh({ refresh_token: 'rt' });
      expect(result).toEqual({ accessToken: 'new-at' });
    });

    it('should throw HttpException on error', async () => {
      mockJwtServiceObj.refreshAccessToken.mockRejectedValue(new Error('Invalid'));
      await expect(controller.refresh({ refresh_token: 'bad' })).rejects.toThrow(HttpException);
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      mockUsersService.logout.mockResolvedValue(undefined);
      const result = await controller.logout({ refreshToken: 'rt' });
      expect(result).toEqual({ message: 'Logged out successfully' });
    });

    it('should throw HttpException on error', async () => {
      mockUsersService.logout.mockRejectedValue(new Error('fail'));
      await expect(controller.logout({ refreshToken: 'rt' })).rejects.toThrow(HttpException);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      mockUsersService.findAll.mockResolvedValue([{ id: 1 }]);
      expect(await controller.findAll()).toEqual([{ id: 1 }]);
    });
  });

  describe('findOne', () => {
    it('should return user by id', async () => {
      mockUsersService.findOne.mockResolvedValue({ id: 1 });
      expect(await controller.findOne('1')).toEqual({ id: 1 });
      expect(mockUsersService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('getUserWithTickets', () => {
    it('should return user tickets', async () => {
      mockUsersService.findTicketsUser.mockResolvedValue([{ id: 1 }]);
      expect(await controller.getUserWithTickets(1 as any)).toEqual([{ id: 1 }]);
    });
  });

  describe('updateUserById', () => {
    it('should update by id', async () => {
      mockUsersService.update.mockResolvedValue({ id: 1 });
      expect(await controller.updateUserById(1 as any, {} as any)).toEqual({ id: 1 });
    });
  });

  describe('update', () => {
    it('should update', async () => {
      mockUsersService.update.mockResolvedValue({ id: 1 });
      expect(await controller.update('1', {} as any)).toEqual({ id: 1 });
      expect(mockUsersService.update).toHaveBeenCalledWith(1, {});
    });
  });

  describe('remove', () => {
    it('should remove', async () => {
      mockUsersService.remove.mockResolvedValue(true);
      expect(await controller.remove('1')).toBe(true);
      expect(mockUsersService.remove).toHaveBeenCalledWith(1);
    });
  });
});
